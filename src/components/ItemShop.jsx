import { useState } from 'react';
import { PARTNER_GENDER } from '../gameItems';
import { formatDollars } from '../gameEngine';

// Determine whether an item should show a "gift" option
function canGift(item, gs) {
  if (!gs.relationshipPartnerId) return false;
  const gender = PARTNER_GENDER[gs.relationshipPartnerId];
  if (item.giftMode === 'male')   return gender === 'male';
  if (item.giftMode === 'female') return gender === 'female';
  if (item.giftMode === 'any')    return true;
  return false;
}

// Determine whether an item should show a "use" option for the player
function canUse(item, gs) {
  if (item.giftMode === 'none') return true;
  if (item.selfForFemaleCharOnly) return gs.characterId === 'paige';
  return true; // male-giftable and universal items: player can always use for self
}

function formatEffects(effects) {
  return Object.entries(effects).map(([k, v]) => (
    <span key={k} className={`mp-effect ${v < 0 ? 'neg' : 'pos'}`}>
      {k} {v > 0 ? '+' : ''}{v}
    </span>
  ));
}

// Modal for items that have a gift option
function GiftModal({ item, gs, onChoice, onClose }) {
  const showUse  = canUse(item, gs);
  const partnerName = gs.relationshipPartnerId
    ? (gs.relationshipPartnerId.charAt(0).toUpperCase() + gs.relationshipPartnerId.slice(1))
    : 'your date';

  return (
    <div className="item-modal-overlay" onClick={onClose}>
      <div className="item-modal" onClick={e => e.stopPropagation()}>
        <img src={item.image} alt={item.name} className="item-modal-img" />
        <div className="item-modal-title">{item.name}</div>
        <div className="item-modal-cost">{formatDollars(item.cost)}</div>
        <div className="item-modal-prompt">What would you like to do?</div>
        <div className="item-modal-choices">
          {showUse && (
            <button className="btn btn-primary item-modal-btn" onClick={() => onChoice('use')}>
              <span className="item-modal-btn-label">Keep it</span>
              <span className="item-modal-btn-effects">{formatEffects(item.selfEffects)}</span>
            </button>
          )}
          <button className="btn btn-secondary item-modal-btn" onClick={() => onChoice('gift')}>
            <span className="item-modal-btn-label">Gift to {partnerName}</span>
            <span className="item-modal-btn-effects">{formatEffects(item.giftEffects)}</span>
          </button>
        </div>
        <button className="item-modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function ItemShop({ gameState: gs, quarterlyItems, onItemPurchase }) {
  const [pendingItem, setPendingItem] = useState(null);

  const wealth           = gs.stats.wealth;
  const alreadyPurchased = gs.itemPurchasedThisQuarter;

  const handleCardClick = (item) => {
    if (alreadyPurchased) return;
    const affordable = item.cost <= wealth;
    if (!affordable) return;

    const showGift = canGift(item, gs);
    const showUse  = canUse(item, gs);

    // If both use and gift are options, show the modal
    if (showGift && showUse) {
      setPendingItem(item);
      return;
    }
    // If only gift (Paige item on Max with female date — no self use)
    if (showGift && !showUse) {
      onItemPurchase(item, 'gift');
      return;
    }
    // Default: use for self (no gift option or gift-only hidden)
    onItemPurchase(item, 'use');
  };

  const handleModalChoice = (choice) => {
    if (!pendingItem) return;
    onItemPurchase(pendingItem, choice);
    setPendingItem(null);
  };

  // Only show items that have at least one valid action for this player/partner combo
  const visibleItems = quarterlyItems.filter(item => canUse(item, gs) || canGift(item, gs));

  return (
    <>
      <div id="tut-items" className={`mp-category item-shop-row${alreadyPurchased ? ' item-row-purchased' : ''}`}>
        <div className="mp-cat-label">Items</div>
        <div className="mp-activity-grid">
          {visibleItems.map(item => {
            const affordable  = item.cost <= wealth;
            const unavailable = !affordable || alreadyPurchased;
            const showGift    = canGift(item, gs);
            const showUse     = canUse(item, gs);

            return (
              <button
                key={item.id}
                className={`mp-card item-card ${!affordable ? 'unaffordable' : ''}`}
                onClick={() => handleCardClick(item)}
                disabled={unavailable}
              >
                <img src={item.image} alt={item.name} className="item-card-img" />
                <div className="mp-card-body">
                  <div className="mp-card-name">{item.name}</div>
                  <div className={`mp-card-cost ${!affordable ? 'unaffordable' : ''}`}>
                    {formatDollars(item.cost)}
                  </div>
                  <div className="mp-card-effects">
                    {showUse && formatEffects(item.selfEffects)}
                    {showGift && item.giftEffects && (
                      <span className="mp-effect pos item-gift-hint">
                        or gift: intimacy +{item.giftEffects.intimacy}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {pendingItem && (
        <GiftModal
          item={pendingItem}
          gs={gs}
          onChoice={handleModalChoice}
          onClose={() => setPendingItem(null)}
        />
      )}
    </>
  );
}

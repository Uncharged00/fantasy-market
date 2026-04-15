const itemsData = [
    { id: 'rusty_sword', name: 'Rusty Sword', rarity: 'common', basePrice: 20, volatility: 0.05 },
    { id: 'wooden_shield', name: 'Wooden Shield', rarity: 'common', basePrice: 35, volatility: 0.04 },
    { id: 'iron_ring', name: 'Iron Ring', rarity: 'common', basePrice: 50, volatility: 0.06 },
    
    { id: 'steel_longsword', name: 'Steel Longsword', rarity: 'uncommon', basePrice: 120, volatility: 0.08 },
    { id: 'knights_armor', name: 'Knight\'s Armor', rarity: 'uncommon', basePrice: 180, volatility: 0.07 },
    
    { id: 'elven_cloak', name: 'Elven Cloak', rarity: 'rare', basePrice: 450, volatility: 0.12 },
    { id: 'ruby_pendant', name: 'Ruby Pendant', rarity: 'rare', basePrice: 800, volatility: 0.15 },
    
    { id: 'dragonbone_sword', name: 'Dragonbone Greatsword', rarity: 'epic', basePrice: 2500, volatility: 0.20 },
    { id: 'sapphire_crown', name: 'Sapphire Crown', rarity: 'epic', basePrice: 4000, volatility: 0.22 },
    
    { id: 'excalibur', name: 'Excalibur', rarity: 'mythic', basePrice: 12000, volatility: 0.30 },
    { id: 'eye_leviathan', name: 'Eye of Leviathan', rarity: 'mythic', basePrice: 18000, volatility: 0.35 }
];

let balance = 500.00;
let inventory = {};
let market = {};

const TICK_RATE = 5000;
let nextTickTime = Date.now() + TICK_RATE;

function init() {
    itemsData.forEach(item => {
        market[item.id] = {
            ...item,
            currentPrice: item.basePrice,
            history: [item.basePrice],
            trend: 0
        };
    });
    
    updateUI();
    
    setInterval(() => {
        let remaining = Math.ceil((nextTickTime - Date.now()) / 1000);
        if (remaining < 1) remaining = 1;
        document.getElementById('tick-timer').innerText = `${remaining}s`;
    }, 250);
    
    setInterval(() => {
        marketTick();
        nextTickTime = Date.now() + TICK_RATE;
    }, TICK_RATE);
}

function marketTick() {
    Object.keys(market).forEach(id => {
        let item = market[id];
        
        let eventMultiplier = 1;
        if (Math.random() < 0.05) eventMultiplier = 1.5;
        if (Math.random() < 0.05) eventMultiplier = 0.5;
        
        let changePercent = (Math.random() * 2 - 1) * item.volatility * eventMultiplier;
        
        if (Math.random() < 0.3) {
            item.trend = Math.random() > 0.5 ? 1 : -1;
        }
        changePercent += item.trend * (item.volatility / 3);
        
        let newPrice = item.currentPrice * (1 + changePercent);
        
        if (newPrice < item.basePrice * 0.2) newPrice = item.basePrice * 0.2;
        if (newPrice > item.basePrice * 5) newPrice = item.basePrice * 5;
        
        item.history.push(newPrice);
        if (item.history.length > 10) item.history.shift();
        
        item.currentPrice = newPrice;
    });
    
    updateUI();
}

function buyItem(id) {
    let item = market[id];
    if (balance >= item.currentPrice) {
        balance -= item.currentPrice;
        
        if (!inventory[id]) {
            inventory[id] = { amount: 0, avgBuyPrice: 0, totalSpent: 0 };
        }
        
        inventory[id].amount += 1;
        inventory[id].totalSpent += item.currentPrice;
        inventory[id].avgBuyPrice = inventory[id].totalSpent / inventory[id].amount;
        
        updateUI();
    }
}

function sellItem(id) {
    if (inventory[id] && inventory[id].amount > 0) {
        let item = market[id];
        balance += item.currentPrice;
        
        inventory[id].amount -= 1;
        inventory[id].totalSpent -= inventory[id].avgBuyPrice;
        
        if (inventory[id].amount === 0) {
            delete inventory[id];
        }
        
        updateUI();
    }
}

function updateUI() {
    document.getElementById('balance').innerText = `${balance.toFixed(2)} €`;
    
    let netWorth = balance;
    Object.keys(inventory).forEach(id => {
        netWorth += inventory[id].amount * market[id].currentPrice;
    });
    document.getElementById('net-worth').innerText = `${netWorth.toFixed(2)} €`;
    
    const marketEl = document.getElementById('market');
    
    Object.values(market).forEach(item => {
        let oldPrice = item.history.length > 1 ? item.history[item.history.length - 2] : item.currentPrice;
        let trendClass = item.currentPrice >= oldPrice ? 'trend-up' : 'trend-down';
        let trendIcon = item.currentPrice >= oldPrice ? '▲' : '▼';
        
        let card = document.getElementById(`market-item-${item.id}`);
        
        if (!card) {
            card = document.createElement('div');
            card.className = 'item-card';
            card.id = `market-item-${item.id}`;
            
            let headerDiv = document.createElement('div');
            headerDiv.className = 'item-header';
            headerDiv.innerHTML = `<span class="rarity-${item.rarity}">${item.name}</span><span class="rarity-${item.rarity}" style="font-size: 0.8rem; text-transform: uppercase;">${item.rarity}</span>`;
            
            let priceDiv = document.createElement('div');
            priceDiv.className = `item-price`;
            priceDiv.id = `price-${item.id}`;
            
            let actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';
            
            let buyBtn = document.createElement('button');
            buyBtn.className = 'btn-buy';
            buyBtn.id = `buy-${item.id}`;
            buyBtn.innerText = 'Buy';
            buyBtn.onclick = () => buyItem(item.id);
            
            let sellBtn = document.createElement('button');
            sellBtn.className = 'btn-sell';
            sellBtn.id = `sell-${item.id}`;
            sellBtn.innerText = 'Sell';
            sellBtn.onclick = () => sellItem(item.id);
            
            actionsDiv.appendChild(buyBtn);
            actionsDiv.appendChild(sellBtn);
            
            card.appendChild(headerDiv);
            card.appendChild(priceDiv);
            card.appendChild(actionsDiv);
            
            marketEl.appendChild(card);
        }
        
        let priceDiv = document.getElementById(`price-${item.id}`);
        priceDiv.className = `item-price ${trendClass}`;
        priceDiv.innerHTML = `${item.currentPrice.toFixed(2)} € <span style="font-size: 1.2rem; margin-left: 4px;">${trendIcon}</span>`;
        
        let buyBtn = document.getElementById(`buy-${item.id}`);
        buyBtn.disabled = balance < item.currentPrice;
        
        let sellBtn = document.getElementById(`sell-${item.id}`);
        sellBtn.disabled = !inventory[item.id];
    });
    
    const invEl = document.getElementById('inventory');
    
    Array.from(invEl.children).forEach(child => {
        if (child.id === 'empty-inv-msg') {
            if (Object.keys(inventory).length > 0) child.remove();
        } else {
            let id = child.id.replace('inv-item-', '');
            if (!inventory[id]) {
                child.remove();
            }
        }
    });

    if (Object.keys(inventory).length === 0) {
        if (!document.getElementById('empty-inv-msg')) {
            let emptyMsg = document.createElement('p');
            emptyMsg.id = 'empty-inv-msg';
            emptyMsg.style.color = 'var(--text-muted)';
            emptyMsg.innerText = 'Your inventory is empty.';
            invEl.appendChild(emptyMsg);
        }
    } else {
        Object.keys(inventory).forEach(id => {
            let invItem = inventory[id];
            let mktItem = market[id];
            let profit = (mktItem.currentPrice - invItem.avgBuyPrice) * invItem.amount;
            let profitClass = profit >= 0 ? 'trend-up' : 'trend-down';
            let profitSign = profit >= 0 ? '+' : '';
            
            let el = document.getElementById(`inv-item-${id}`);
            if (!el) {
                el = document.createElement('div');
                el.className = 'inv-item';
                el.id = `inv-item-${id}`;
                
                let detailsDiv = document.createElement('div');
                detailsDiv.className = 'inv-details';
                detailsDiv.id = `inv-details-${id}`;
                
                let sellBtn = document.createElement('button');
                sellBtn.className = 'btn-sell';
                sellBtn.style.flex = '0 0 80px';
                sellBtn.style.padding = '8px';
                sellBtn.innerText = 'Sell 1';
                sellBtn.onclick = () => sellItem(id);
                
                el.appendChild(detailsDiv);
                el.appendChild(sellBtn);
                invEl.appendChild(el);
            }
            
            let detailsDiv = document.getElementById(`inv-details-${id}`);
            detailsDiv.innerHTML = `
                <span class="inv-name rarity-${mktItem.rarity}">${mktItem.name}</span>
                <span class="inv-amount">Owned: <strong>${invItem.amount}</strong> &nbsp;|&nbsp; Avg Cost: ${invItem.avgBuyPrice.toFixed(2)} €</span>
                <span class="inv-profit ${profitClass}">Profit: ${profitSign}${profit.toFixed(2)} €</span>
            `;
        });
    }
}

window.onload = init;
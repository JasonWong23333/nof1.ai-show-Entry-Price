// ==UserScript==
// @name         NOF1 show Entry Price
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  在unreal P&L旁边显示建仓买入价
// @author       You
// @match        https://nof1.ai/*
// @icon         https://nof1.ai/logos/favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .entry-price-row {
            display: grid;
            grid-template-columns: subgrid;
            grid-column: 1 / -1;
            margin-top: 4px;
            padding-top: 4px;
            padding-bottom: 4px;
            border-top: 1px dashed #d0d0d0;
            background: linear-gradient(to right, rgba(77, 107, 254, 0.03), rgba(77, 107, 254, 0.01));
            gap: 4px;
        }
        .entry-price-cell {
            display: flex;
            align-items: center;
        }
        .entry-price-cell-left {
            justify-content: flex-start;
        }
        .entry-price-cell-right {
            justify-content: flex-end;
        }
        .entry-price-cell-spread {
            grid-column: 1 / -1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 4px;
        }
        .entry-price-label {
            font-size: 11px;
            font-weight: 700;
            color: #333;
            padding: 3px 8px;
            background: #fff;
            border: 2px solid #4d6bfe;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(77, 107, 254, 0.15);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }
        .entry-price-label::before {
            content: '📊';
            font-size: 12px;
        }
        .entry-price-value {
            color: #4d6bfe;
            font-weight: 700;
            font-size: 12px;
            font-family: 'Courier New', monospace;
        }
        .amount-label {
            font-size: 9px;
            color: #888;
            font-weight: 500;
            padding: 2px 6px;
            background: #f5f5f5;
            border-radius: 3px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
        }
        .amount-value {
            color: #666;
            font-weight: 600;
            font-family: 'Courier New', monospace;
        }
    `;
    document.head.appendChild(style);

    // 获取当前市场价格
    function getCurrentPrices() {
        const prices = {};
        const coinElements = document.querySelectorAll('.flex.items-center');

        coinElements.forEach(element => {
            const imgElement = element.querySelector('img[alt]');
            const priceElement = element.closest('.flex.flex-col')?.querySelector('number-flow-react');

            if (imgElement && priceElement) {
                const coinName = imgElement.alt;
                const priceText = priceElement.getAttribute('data');

                if (priceText) {
                    try {
                        const priceData = JSON.parse(priceText);
                        const price = priceData.value || parseFloat(priceData.valueAsString.replace(/[$,]/g, ''));
                        if (!isNaN(price)) {
                            prices[coinName] = price;
                        }
                    } catch (e) {
                        // 尝试从可见文本中提取
                        const visiblePrice = priceElement.textContent.trim().replace(/[$,]/g, '');
                        const price = parseFloat(visiblePrice);
                        if (!isNaN(price)) {
                            prices[coinName] = price;
                        }
                    }
                }
            }
        });

        return prices;
    }

    // 计算建仓买入价格
    function calculateEntryPrice(notional, unrealizedPnL, currentMarketPrice) {
        // 第一步：计算初始成本价值
        const initialCost = notional - unrealizedPnL;

        // 第二步：计算持有的代币数量
        const coinAmount = notional / currentMarketPrice;

        // 第三步：计算买入价格
        const entryPrice = initialCost / coinAmount;

        return entryPrice;
    }

    // 添加建仓价格到持仓列表
    function addEntryPriceToPositions() {
        // 获取当前市场价格
        const currentPrices = getCurrentPrices();

        // 查找持仓表格容器
        const positionContainers = document.querySelectorAll('.space-y-2.pl-1.pr-1.relative');

        positionContainers.forEach(container => {
            // 获取所有行（包括表头和数据行）
            const allRows = container.querySelectorAll('.grid.grid-cols-6');

            allRows.forEach((row, index) => {
                // 跳过表头（通常第一行包含 "SIDE", "COIN" 等文字）
                const firstCell = row.querySelector('div');
                if (!firstCell || firstCell.textContent.trim() === 'SIDE') return;

                // 检查是否已经添加过
                if (row.nextElementSibling?.classList.contains('entry-price-row')) return;

                const cells = row.querySelectorAll('div');
                if (cells.length < 6) return;

                // 提取币种名称
                const coinCell = cells[1];
                const coinImg = coinCell.querySelector('img[alt]');
                const coinName = coinImg ? coinImg.alt : '';

                // 提取数值
                const notionalText = cells[3].textContent.trim();
                const unrealPnLText = cells[5].textContent.trim();

                const notional = parseFloat(notionalText.replace(/[$,]/g, ''));
                const unrealizedPnL = parseFloat(unrealPnLText.replace(/[$,]/g, ''));

                // 获取当前市场价格
                const currentMarketPrice = currentPrices[coinName];

                if (!isNaN(notional) && !isNaN(unrealizedPnL) && currentMarketPrice) {
                    // 计算建仓买入价格
                    const entryPrice = calculateEntryPrice(notional, unrealizedPnL, currentMarketPrice);

                    // 计算持有数量
                    const coinAmount = notional / currentMarketPrice;

                    // 创建新的一行显示买入价格（跨越所有列）
                    const entryPriceRow = document.createElement('div');
                    entryPriceRow.className = 'entry-price-row';

                    // 创建一个跨越所有列的单元格
                    const spreadCell = document.createElement('div');
                    spreadCell.className = 'entry-price-cell-spread';

                    // ENTRY 标签（左侧）
                    const entryPriceLabel = document.createElement('div');
                    entryPriceLabel.className = 'entry-price-label';
                    entryPriceLabel.innerHTML = `ENTRY: <span class="entry-price-value">$${entryPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>`;

                    // QTY 标签（右侧）
                    const amountLabel = document.createElement('div');
                    amountLabel.className = 'amount-label';
                    amountLabel.innerHTML = `QTY: <span class="amount-value">${coinAmount.toFixed(6)}</span>`;

                    spreadCell.appendChild(entryPriceLabel);
                    spreadCell.appendChild(amountLabel);
                    entryPriceRow.appendChild(spreadCell);

                    // 在当前行后插入新行
                    row.parentNode.insertBefore(entryPriceRow, row.nextSibling);
                }
            });
        });
    }

    // 观察DOM变化
    let isProcessing = false;
    const observer = new MutationObserver((mutations) => {
        if (isProcessing) return;
        isProcessing = true;

        setTimeout(() => {
            addEntryPriceToPositions();
            isProcessing = false;
        }, 100);
    });

    // 启动观察
    function startObserving() {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 初始化
    function init() {
        const runScript = () => {
            setTimeout(() => {
                addEntryPriceToPositions();
                startObserving();
            }, 1500);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runScript);
        } else {
            runScript();
        }
    }

    init();
})();
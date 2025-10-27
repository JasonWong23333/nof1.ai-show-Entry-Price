# 📊 NOF1 Entry Price Display

A Tampermonkey userscript that displays entry prices for positions on [nof1.ai](https://nof1.ai/) 🚀

![Screenshot](image.PNG)

## ✨ Features

- 📈 **Entry Price Calculation** - Automatically calculates and displays the average entry price for each position
- 🔢 **Position Quantity** - Shows the amount of coins held in each position
- 🎯 **Real-time Updates** - Dynamically updates as positions change
- 💅 **Clean UI** - Seamlessly integrates with the existing interface

## 🧮 Calculation Formula

The script uses the following three-step calculation:

**Step 1:** Calculate Initial Cost Value
Initial Cost = Current Notional - Unrealized P&L

**Step 2:** Calculate Coin Quantity
Coin Quantity = Current Notional / Current Market Price

**Step 3:** Calculate Entry Price
Entry Price = Initial Cost / Coin Quantity


### 📝 Example (BTC)

Given:
- Current Notional: **$13,820**
- Unrealized P&L: **$938.82**
- Current Market Price: **$115,166.50**

Calculation:
1. Initial Cost = $13,820 - $938.82 = **$12,881.18**
2. Coin Quantity = $13,820 / $115,166.50 ≈ **0.11999 BTC**
3. Entry Price = $12,881.18 / 0.11999 ≈ **$107,352.27**

## 🚀 Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click [here](#) to install the script (or copy from the source file)
3. Visit [nof1.ai](https://nof1.ai/)
4. Entry prices will automatically appear below each position! ✅

## 🎨 Display Format

For each position, a new row appears showing:
- **ENTRY**: 📊 Average entry price (highlighted with blue border)
- **QTY**: Coin quantity held (subtle gray display)

## 🛠️ Tech Stack

- Pure JavaScript
- CSS Grid for perfect alignment
- MutationObserver for real-time updates

## 📜 License

MIT License - Feel free to use and modify! 🎉

## 🤝 Contributing

Issues and pull requests are welcome!

---

Made with ❤️ for better crypto trading insights

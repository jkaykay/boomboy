# 🎮 Boomboy

An endless runner browser game built with Phaser.js where you control Boomboy, a heroic character who must survive as long as possible by avoiding and defeating enemies in an infinite forest environment.

## 🚀 Setup & Installation

**⚠️ Important**: This game requires a web server to run properly due to Phaser.js CORS restrictions and ES6 module loading. You cannot simply open `index.html` directly in your browser.

**⚠️ Important #2**: This game only functions if your monitor/frame rate is set to 60hz/60fps.

### Option 1: Local Development Server

Choose one of these methods to run a local server:

#### Python (if installed)
```bash
# Navigate to the game directory
cd path/to/Boomboy

# Python 3
python -m http.server 8000

# Python 2 (legacy)
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

#### Node.js (if installed)
```bash
# Install a simple server globally
npm install -g http-server

# Navigate to game directory and start server
cd path/to/Boomboy
http-server -p 8000
```
Then open `http://localhost:8000` in your browser.

#### VS Code Live Server Extension
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 2: GitHub Pages (Recommended for Sharing)

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Set source to "Deploy from a branch" → main branch
4. Your game will be available at `https://yourusername.github.io/repository-name`

## 🎯 How to Play

1. Start your local server or visit the GitHub Pages URL
2. Register an account or login via the registration page
3. Navigate to the game page and click play to start your adventure!

## 🎮 Game Overview

**Objective**: Survive as long as possible while your score increases. Avoid or defeat enemies using your abilities while the game gets progressively faster and more challenging.

**Genre**: Endless Runner / Action Platformer  
**Platform**: Web Browser  
**Technology**: HTML5, JavaScript, Phaser.js  

## 🕹️ Controls

| Key | Action |
|-----|--------|
| **W** | Jump over enemies and obstacles |
| **S** | Slide under flying enemies (hold to maintain) |
| **→** | Shoot energy beams at enemies |

**Pro Tip**: You can shoot while jumping for aerial combat!

## 🎮 Gameplay Features

### Character Abilities
- **Run**: Default movement with smooth animations
- **Jump**: Leap over ground enemies and obstacles  
- **Slide**: Duck under flying threats
- **Shoot**: Fire energy beams to defeat enemies
- **Aerial Combat**: Shoot while airborne for tactical advantage

### Enemy Types
- 🐦 **Red Birds**: Flying enemies at various heights - shoot them down!
- 🐺 **Wolves**: Fast ground runners - jump over or eliminate
- 🐸 **Frogs**: Jumping enemies with 2 health points - persistent threats
- 🐵 **Monkeys**: Smart aerial enemies that dive toward your position

### Health & Scoring
- ❤️ Start with 3 health points displayed as a health bar
- 🏆 Score increases by 10 points continuously as you survive
- 📈 Personal best and global leaderboards track your progress
- ⚡ Game speed increases every 100 points for escalating difficulty

### Progressive Difficulty
- Base scroll speed starts at 400, increasing by 2.5% every 100 points
- Enemy spawn rates and movement speeds scale with your score
- Parallax background layers speed up creating intense visual feedback
- Maximum speed cap ensures the game remains playable

## 🌟 Special Features

- **Infinite Parallax Scrolling**: Multi-layered forest background with clouds
- **Dynamic Audio**: Background music and sound effects for all actions
- **User Account System**: Register and track personal bests locally
- **Leaderboard**: Compete with other players for high scores
- **Smooth Animations**: Fluid character and enemy sprite animations
- **Game Over Sequence**: Dramatic slowdown and score tallying

## 🛠️ Technical Requirements

### Server Requirements
- **Local Development**: Any HTTP server (Python, Node.js, Apache, etc.)
- **Production**: Static file hosting (GitHub Pages, Netlify, etc.)
- **⚠️ File Protocol Not Supported**: Cannot run via `file://` URLs

### Browser Support
- Modern web browser with HTML5 Canvas support
- JavaScript ES6 module support required
- Local Storage enabled for user accounts
- **CORS Policy**: Must be served over HTTP/HTTPS protocol

### Dependencies
- **Phaser.js 3.x**: Included game engine (`scripts/phaser.min.js`)
- **HTML5 Audio**: MP3 support for sound effects and music

### Resolution
- **Native**: 1366x768 pixels
- **Scaling**: Automatic fit-to-screen with device pixel ratio support

## 📁 Project Structure

```
/
├── index.html              # Main home page
├── html/
│   ├── playgame.html      # Game interface
│   ├── reglog.html        # User registration/login
│   └── leaderboard.html   # Score rankings
├── scripts/
│   ├── game.js            # Main game logic
│   ├── validate.js        # User validation
│   └── phaser.min.js      # Game engine
├── styles/                # CSS styling
├── assets/
│   ├── sprites/           # Character and environment sprites
│   ├── audio/             # Sound effects and music
│   └── images/            # UI elements and backgrounds
└── ico/                   # Favicon files
```

## 🏆 How to Win

There is no "winning" in the traditional sense - Boomboy is all about survival and achieving high scores! Challenge yourself to:

- Beat your personal best score
- Climb the leaderboard rankings  
- Master the art of jump-shooting
- Survive the maximum speed levels
- Achieve perfect enemy elimination streaks

## 🎯 Tips & Strategy

1. **Learn Enemy Patterns**: Each enemy type has predictable behavior - use it to your advantage
2. **Conserve Health**: Sometimes avoiding is better than fighting
3. **Master Combo Moves**: Jumping while shooting gives you tactical superiority
4. **Watch the Speed**: As the game accelerates, plan your moves earlier
5. **Use Sliding Strategically**: Sliding can help you avoid multiple threats at once

## 🔧 Troubleshooting

### Common Issues

**Game won't load / Blank screen**
- Ensure you're running a web server, not opening files directly
- Check browser console for CORS errors
- Verify all asset paths are accessible via HTTP

**"Cannot load modules" error**
- This indicates file:// protocol usage - start a web server instead
- Make sure server is serving from the correct directory

**Assets not loading**
- Check that the server has access to the `/assets/` directory
- Verify relative paths are correct from the server root

## 🎨 Credits

**Game Development**: Built as part of Web Development and Databases coursework  
**Game Engine**: Powered by Phaser.js  
**Art & Design**: Custom sprite work and parallax backgrounds  
**Audio**: Immersive sound design with multiple audio layers  

---

**Ready to become the ultimate Boomboy?** Set up your server and start your endless adventure! 🚀

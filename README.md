# 围棋乐园 | Go Learning Garden

A child-friendly Go (Weiqi/Baduk) learning application designed for 6-year-old children. Features an interactive 9x9 board, AI opponent with adjustable difficulty, puzzle mode, and gamified learning with rewards.

## Features

- **Interactive 9x9 Go Board**: Click-to-place stones with animations
- **AI Opponent**: 5 difficulty levels from beginner to advanced
- **Puzzle Mode**: 16 built-in puzzles across 3 difficulty levels
- **Gamified Learning**: Star collection, level progression, and mini-games
- **Voice Feedback**: Chinese speech synthesis for coaching
- **Review Mode**: Territory visualization and detailed scoring
- **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
- **Progress Tracking**: LocalStorage persistence for game progress

## Game Modes

1. **启蒙课 (Learning Mode)**: Learn capturing and connecting basics
2. **题库闯关 (Puzzle Mode)**: Challenge yourself with tsumego puzzles
3. **对战练习 (Battle Mode)**: Practice against the AI fox
4. **故事关卡 (Story Mode)**: Adventure through the Go forest (coming soon)
5. **奖励乐园 (Reward Mode)**: Mini-games - star catching and memory matching

## Difficulty Levels

The AI has 5 levels:
- 启蒙 1-2 (Enlightenment 1-2): Beginner-friendly
- 小棋童 1-2 (Little Player 1-2): Intermediate
- 小棋士 1 (Little Master 1): Advanced

## Technical Details

- **Pure Client-Side**: No backend required, runs entirely in the browser
- **Vanilla JavaScript**: No frameworks or build process
- **LocalStorage**: Progress persistence without authentication
- **Responsive Design**: Works on desktop and mobile devices

## File Structure

```
weiqi/
├── index.html      # Main application
├── app.js          # Game logic (1038 lines)
├── styles.css      # Styling with custom design system
├── puzzles.json    # Puzzle database
├── README.md       # This file
└── 1.jpg, 2.jpg, 3.jpg  # UI reference images
```

## Getting Started

1. Open `index.html` in a modern web browser
2. Or deploy to Vercel/Netlify for static hosting

## Puzzle Format

Puzzles can be imported via JSON with this structure:

```json
{
  "levels": [
    {
      "id": "basic",
      "name": "启蒙",
      "puzzles": [
        {
          "title": "数气：吃掉一颗白子",
          "stones": [
            {"row": 3, "col": 3, "color": "black"},
            {"row": 3, "col": 4, "color": "white"}
          ],
          "answer": {"row": 4, "col": 4}
        }
      ]
    }
  ]
}
```

## Browser Compatibility

- Chrome/Edge: Full support including voice
- Safari: Full support including voice
- Firefox: Full support (voice may vary)
- Mobile browsers: Responsive design included

## Keyboard Shortcuts

- `Escape`: Close modals
- `Tab`: Navigate through interactive elements
- `Enter/Space`: Activate buttons and board intersections

## Credits

Designed for 歪歪, a 6-year-old Go learner.

Built with vanilla web technologies - no frameworks, no build tools, just pure HTML, CSS, and JavaScript.

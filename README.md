# csi-miami-game
A knock-off of Storm the House, except you're defending Miami against coronavirus

Made with Phaser 3.

This is heavily based on old Flash games like Defend the Castle, Storm the House, and Bowmaster Prelude. 
You take on the role of a disgruntled Miami citizen who builds a barricade against waves of spring breakers.
You have access to non-lethal "social distancing enforcement tools" to send them back home where they belong.

Current Weapons:
1) Teleporter gun - Default weapon, sends people home with one click
2) Education - Destroy them with facts and logic (launch an enormous book)
3) Portal gun - Opens a portal in the ground that leads "home"
4) Pikachu - Hold down to charge (increases AOE), release to send them blasting off again
5) Hiraishin no Jutsu - Scatter teleportation kunai randomly over a large area (Naruto Chapter 242, page 4-5)
6) Bubbleblower - A flamethrower, but you swapped out napalm for dish soap

Ideas and Next Steps:
1) Code refactoring
- There are several TODOs throughout the code
- There are several hard-coded values
- Most of the game logic is in battleScene.js with a ton of globals
- Use object pool pattern to avoid redrawing objects over and over
2) Improve art, add animations, add sound effects
3) Implement the shop and upgrades
4) Add general features (e.g. pause game function, volume control, better UI, etc)
5) Implement "field obstacles" that represent quarantine activities and have various affects on enemies
- Video Games: Stops enemies in their tracks for a certain amount of time (they stop to play video games)
- TV: Sends enemies to the beginning of the screen (they temporarily go home to Netflix and chill)
- Exercise: Slows enemy walk speed (they get tired out)

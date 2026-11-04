# Final-page animal pictures and GIFs

The final screen uses `deermic.jpg`, `cat1.gif` through `cat8.gif`, `cat9.jpg`, and `cat10.gif` through `cat17.gif`. The deer is visible immediately, while the seventeen cats fade in together over five seconds. Clicking Done starts `OIIA.mp3` within that gesture and shows the final screen in the same document. Browser Back stops music and restores the flowers. The standalone `final.html` preview still depends on browser autoplay permissions and retries on a tap or key press. Reduced-motion mode shows all pictures immediately.

Save additional animal pictures or animated GIFs in this folder, then add a `.collage-photo.collage-photo--extra` figure with its image path and descriptive alt text inside `.birthday-collage` in `../final-screen.js`. The collage automatically wraps and tilts each picture. Use the additional `is-cutout` class for animal images with transparent backgrounds.

GIFs remain animated when displayed with an image element, including when cropped with CSS. Removing a moving animal's background requires processing its animation frames; simply cropping the image only changes its rectangular framing.

# Tulip GIF

The tulip uses `wait-a-minute-who-are-you.gif` with `waitaminute.mp3` becoming audible one second after the GIF appears. The audio is a separate file because GIF files do not contain audio. Opening or replaying primes muted playback in the click gesture, then rewinds and unmutes after the delay; closing cancels that delay.

The current file contains 62 animation frames, lasting 4.96 seconds per cycle. The birthday message appears after the GIF cycle and delayed sound have had time to finish. The countdown starts after the image loads. Opening or replaying the surprise restarts both GIF and sound with the same one-second delay; closing cancels the countdown and stops the sound. The sound also stops when the birthday message appears. If a browser blocks sound, Play sound restarts both from a new tap.

To use an animated version, replace the GIF and set `data-duration-ms` on `#tulip-gif` in `flowers.html` to one full animation cycle in milliseconds. GIF images do not provide a browser `ended` event.

The message is in `flowers.html` inside `#tulip-birthday`. Edit the heading or add paragraphs there when your message is ready.

# Thai magnolia audio

The Thai magnolia gift uses `PartyBlower.mp3`. Clicking the gift plays it; resetting or closing the gift stops it.

# Chrysanthemum audio

The puzzle uses `ourtable.mp3` in this folder. Placing the last brick starts playback and shatters the table; the audio's `ended` event starts the fade into the Kudoboard message after the shatter animation completes. If playback is blocked, the page offers a Play sound button. If the file cannot load, Continue opens the reveal.

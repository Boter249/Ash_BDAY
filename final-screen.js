"use strict";

function createFinalScreen() {
  const template = document.createElement("template");
  template.innerHTML = `
  <div class="confetti-pattern" aria-hidden="true"></div>
  <div class="final-celebration" id="final-celebration" aria-hidden="true"></div>
  <main class="final-main">
    <article class="final-card" aria-labelledby="final-title">
      <div class="birthday-sprinkles" aria-hidden="true">
        <span>&#10022;</span><span>&#9829;</span><span>&#10022;</span>
        <span>&#9829;</span><span>&#10022;</span><span>&#9829;</span>
      </div>
      <h1 id="final-title">Happy Birthday Ash!</h1>
      <audio id="final-music" src="media/OIIA.mp3" preload="auto" autoplay></audio>
      <div class="birthday-collage" role="group" aria-label="Birthday animal pictures and GIFs">
        <!-- The deer is visible immediately. The other pictures fade in over five seconds. -->
        <figure class="collage-photo">
          <img src="media/deermic.jpg" alt="A deer being interviewed with a microphone" width="735" height="915">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat1.gif" alt="A cat with a pink nose looking into the camera" width="400" height="400">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat2.gif" alt="Birthday cat GIF 2" width="498" height="485">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat3.gif" alt="Birthday cat GIF 3" width="164" height="256">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat4.gif" alt="Birthday cat GIF 4" width="64" height="64">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat5.gif" alt="Birthday cat GIF 5" width="200" height="200">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat6.gif" alt="Birthday cat GIF 6" width="204" height="96">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat7.gif" alt="Birthday cat GIF 7" width="320" height="320">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat8.gif" alt="Birthday cat GIF 8" width="173" height="172">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat9.jpg" alt="A wide-eyed orange kitten" width="500" height="542">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat10.gif" alt="Birthday cat GIF 10" width="640" height="640">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat11.gif" alt="Birthday cat GIF 11" width="374" height="294">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat12.gif" alt="Birthday cat GIF 12" width="200" height="200">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat13.gif" alt="Birthday cat GIF 13" width="498" height="483">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat14.gif" alt="Birthday cat GIF 14" width="211" height="374">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat15.gif" alt="Birthday cat GIF 15" width="498" height="400">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat16.gif" alt="Birthday cat GIF 16" width="128" height="128">
        </figure>
        <figure class="collage-photo collage-photo--extra">
          <img src="media/cat17.gif" alt="Birthday cat GIF 17" width="140" height="131">
        </figure>
      </div>
    </article>
  </main>
  <template id="final-balloon-template">
    <svg viewBox="0 0 90 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#8B6D59" stroke-linecap="round" stroke-linejoin="round">
        <path d="M45 7C23 5 8 22 10 45 12 65 27 84 44 91 61 85 78 66 80 45 83 23 67 6 45 7Z" fill="currentColor" stroke-width="2.5"/>
        <path d="m44 91-5 9 12-1-5-8" fill="currentColor" stroke-width="2.5"/>
        <path d="M45 101C32 118 60 125 45 143S39 166 47 174" stroke-width="1.7"/>
        <path d="M28 22C20 28 18 38 21 47" stroke="#FFFCF6" stroke-width="4"/>
        <path d="m24 55 2 4" stroke="#FFFCF6" stroke-width="3"/>
      </g>
    </svg>
  </template>
`;
  return template.content;
}

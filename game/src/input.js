// input.js — keyboard + mouse state, one object the whole game reads.
// Keys are edge-triggered for actions (jump, dash, hide) and level-held
// for movement, so a tap never gets eaten by the frame it lands in.

export function createInput() {
  const keys = new Set();
  const pressed = new Set(); // keys pressed since the last consume
  const mouse = { x: 0, y: 0, clicked: false, down: false };

  function onKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(event.code);
    keys.add(event.code);
  }

  function onKeyUp(event) {
    keys.delete(event.code);
  }

  function onMouseMove(event) {
    const rect = event.target.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }

  function onMouseDown(event) {
    mouse.down = true;
    mouse.clicked = true;
    onMouseMove(event);
  }

  function onMouseUp() {
    mouse.down = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  return {
    // Held keys: ArrowLeft/KeyA slow down, ArrowRight/KeyD speed up.
    get left() { return keys.has('ArrowLeft') || keys.has('KeyA'); },
    get right() { return keys.has('ArrowRight') || keys.has('KeyD'); },
    get down() { return keys.has('ArrowDown') || keys.has('KeyS'); },
    // Edge-triggered actions, consumed once by the game loop.
    consumeJump() {
      const hit = pressed.has('Space') || pressed.has('ArrowUp') || pressed.has('KeyW');
      pressed.delete('Space'); pressed.delete('ArrowUp'); pressed.delete('KeyW');
      return hit;
    },
    consumeDash() {
      const hit = pressed.has('ShiftLeft') || pressed.has('ShiftRight') || pressed.has('KeyX');
      pressed.delete('ShiftLeft'); pressed.delete('ShiftRight'); pressed.delete('KeyX');
      return hit;
    },
    consumeHide() {
      const hit = pressed.has('KeyH') || pressed.has('ArrowDown') || pressed.has('KeyS');
      pressed.delete('KeyH'); pressed.delete('ArrowDown'); pressed.delete('KeyS');
      return hit;
    },
    consumeConfirm() {
      const hit = pressed.has('Enter') || pressed.has('NumpadEnter') || mouse.clicked;
      pressed.delete('Enter'); pressed.delete('NumpadEnter');
      mouse.clicked = false;
      return hit;
    },
    consumeRestart() {
      const hit = pressed.has('KeyR');
      pressed.delete('KeyR');
      return hit;
    },
    consumePause() {
      const hit = pressed.has('KeyP') || pressed.has('Escape');
      pressed.delete('KeyP'); pressed.delete('Escape');
      return hit;
    },
    consumeMute() {
      const hit = pressed.has('KeyM');
      pressed.delete('KeyM');
      return hit;
    },
    get mouse() { return mouse; },
    // Test hooks: the autopilot and staged shots drive the same object.
    press(code) { pressed.add(code); keys.add(code); },
    release(code) { keys.delete(code); },
    clearPressed() { pressed.clear(); },
  };
}

/* eslint-disable */
// React wrapper around pixel-player.js — loaded as a sibling script tag.
// Requires window.NRNFPixelPlayer to be present (i.e. <script src="pixel-player.js"></script> earlier).

const { useMemo: useMemoPP } = React;

function usePlayer(name, opts) {
  const optsKey = JSON.stringify(opts || {});
  return useMemoPP(() => {
    if (!window.NRNFPixelPlayer) return null;
    return window.NRNFPixelPlayer.generatePlayer(name || 'unknown', opts);
  }, [name, optsKey]);
}

function PixelPlayer({ name, kit, position, size, mini, style, className }) {
  const player = usePlayer(name, { kit, position });
  if (!player) return null;
  const svg = window.NRNFPixelPlayer.renderPlayerSVG(player, { size, mini, className });
  return <span style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}

Object.assign(window, { PixelPlayer, usePlayer });

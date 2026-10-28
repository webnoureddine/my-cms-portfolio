import { useEffect, useState } from 'react';

// Types each phrase, pauses, deletes, moves to the next. Restarts when the
// list changes (e.g. switching language).
export default function Typewriter({ words, typeSpeed = 65, deleteSpeed = 35, pause = 1800, className = 'tw' }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const key = words.join('|');

  useEffect(() => { setI(0); setText(''); setDeleting(false); }, [key]);

  useEffect(() => {
    if (!words.length) return undefined;
    const full = words[i % words.length];
    let timer;
    if (!deleting && text === full) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      setDeleting(false);
      setI((n) => (n + 1) % words.length);
    } else {
      timer = setTimeout(() => {
        setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
      }, deleting ? deleteSpeed : typeSpeed);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, deleting, i, key]);

  return <span className={className} aria-live="polite">{text}</span>;
}

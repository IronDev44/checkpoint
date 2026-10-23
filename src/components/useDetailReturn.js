import {useLayoutEffect, useRef} from 'react';

// Capture only the current list position, never a tab's navigation history.
export default function useDetailReturn(open) {
  const frame = useRef(null);
  useLayoutEffect(() => {
    if (!open) return undefined;
    if(frame.current!==null)window.cancelAnimationFrame(frame.current);
    const top = window.scrollY, left = window.scrollX;
    const trigger = document.activeElement;
    const activeTab = document.querySelector('.bottom-tabs .tab-btn.active')?.textContent;
    return () => {
      frame.current=window.requestAnimationFrame(() => {
        if(document.querySelector('.bottom-tabs .tab-btn.active')?.textContent!==activeTab)return;
        if (trigger?.isConnected) trigger.focus?.({preventScroll:true});
        window.scrollTo({top, left, behavior:'instant'});
      });
    };
  }, [open]);
}

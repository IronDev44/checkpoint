import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedElement, LocalizedMessage } from "../i18n/Localized";import { useEffect, useRef, useState } from "react";

const clampRating = (value) => Math.max(0, Math.min(10, Number(value) || 0));

export default function RatingSlider({ rating = 0, onRate, onCommit, formatValue }) {useLanguage();
  const safeRating = clampRating(rating);
  const [draftRating, setDraftRating] = useState(safeRating);
  const draggingRef = useRef(false);
  const latestRatingRef = useRef(safeRating);

  useEffect(() => {
    if (draggingRef.current) return;
    setDraftRating(safeRating);
    latestRatingRef.current = safeRating;
  }, [safeRating]);

  const publishRating = () => {
    onRate(latestRatingRef.current);
    onCommit?.(latestRatingRef.current);
  };

  const finishDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    publishRating();
  };

  return (
    <div className="rating-slider-wrap">
      <div className="rating-slider-top">
        <span><LocalizedMessage source={"Note"} values={[]} /></span>
        <strong className="rating-live-value"><LocalizedValue value={
          formatValue(draftRating, "Pas noté")} />
        </strong>
      </div>
      <LocalizedElement __as={"input"}
      type="range"
      aria-label="Note"
      min="0"
      max="10"
      step="0.5"
      value={draftRating}
      className="rating-slider"
      style={{ "--rating-progress": `${draftRating * 10}%` }}
      onPointerDown={(event) => {
        draggingRef.current = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onChange={(event) => {
        const value = clampRating(event.target.value);
        latestRatingRef.current = value;
        setDraftRating(value);
        // Native range handling keeps pointer movement local to this control.
        // Keyboard and accessibility changes are committed immediately.
        if (!draggingRef.current) publishRating();
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onBlur={finishDrag} />

      <div className="rating-scale">
        <span>0</span><span>2.5</span><span>5</span><span>7.5</span><span>10</span>
      </div>
    </div>);

}

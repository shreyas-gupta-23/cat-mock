import { useState } from 'react';

const SECTION_DATA = {
  VARC: {
    title: 'VARC',
    instructions: 'Verbal Ability and Reading Comprehension. 40 minutes.',
    details: 'MCQ wrong answers cost 1 mark. TITA wrong answers cost nothing.',
  },
  DILR: {
    title: 'DILR',
    instructions: 'Data Interpretation and Logical Reasoning. 40 minutes.',
    details: 'You cannot open another section until this clock ends.',
  },
  Quant: {
    title: 'Quantitative Ability',
    instructions: 'Quantitative Ability. 40 minutes.',
    details: 'MCQ wrong answers cost 1 mark. TITA wrong answers cost nothing.',
  },
};

export default function SectionInstructions({ section, onAcknowledge }) {
  const [checked, setChecked] = useState(false);
  const sectionData = SECTION_DATA[section];
  if (!sectionData) return null;

  return (
    <div className="press-overlay">
      <div className="press-modal">
        <p className="kicker">{sectionData.title}</p>
        <h3>{sectionData.instructions}</h3>
        <p>{sectionData.details}</p>
        <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '1rem' }}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          I have read this
        </label>
        <div className="press-row">
          <button type="button" className="press-btn solid" disabled={!checked} onClick={onAcknowledge}>
            Begin
          </button>
        </div>
      </div>
    </div>
  );
}

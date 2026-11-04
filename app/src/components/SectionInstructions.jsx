import { useState } from 'react';

const SECTION_DATA = {
  VARC: {
    title: 'VARC',
    name: 'Verbal Ability and Reading Comprehension',
    details: 'MCQ wrong answers cost 1 mark. TITA wrong answers cost nothing.',
  },
  DILR: {
    title: 'DILR',
    name: 'Data Interpretation and Logical Reasoning',
    details: 'This clock runs only while DILR is open. You can switch to another section and come back.',
  },
  Quant: {
    title: 'Quantitative Ability',
    name: 'Quantitative Ability',
    details: 'MCQ wrong answers cost 1 mark. TITA wrong answers cost nothing.',
  },
};

export default function SectionInstructions({ section, minutes = 40, onAcknowledge }) {
  const [checked, setChecked] = useState(false);
  const sectionData = SECTION_DATA[section];
  if (!sectionData) return null;

  return (
    <div className="press-overlay">
      <div className="press-modal">
        <p className="kicker">{sectionData.title}</p>
        <h3>{sectionData.name}. {minutes} minutes.</h3>
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

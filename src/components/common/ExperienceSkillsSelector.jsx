import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Tag, Sparkles } from 'lucide-react';

export const SKILL_CATEGORIES = {
  'Frontend': [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 
    'Bootstrap', 'Tailwind CSS', 'Responsive Design', 'Accessibility'
  ],
  'Backend': [
    'Python', 'Django', 'Django REST Framework', 'Flask', 'FastAPI', 
    'Node.js', 'Express.js', 'REST APIs', 'GraphQL'
  ],
  'Databases': [
    'SQL', 'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Database Design'
  ],
  'Tools & DevOps': [
    'Git', 'GitHub', 'Linux', 'Docker', 'CI/CD', 'GitHub Actions', 
    'Postman', 'Vercel', 'Render', 'AWS', 'Supabase'
  ],
  'Testing & Quality': [
    'Unit Testing', 'API Testing', 'pytest', 'unittest', 'Jest', 'Playwright', 'Debugging'
  ],
  'Mobile & Other': [
    'Java', 'Kotlin', 'Flutter', 'Android Studio', 'Data Structures', 'Algorithms', 'Machine Learning'
  ]
};

export default function ExperienceSkillsSelector({ selectedSkills = [], onChange }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customSkillError, setCustomSkillError] = useState('');

  const categories = useMemo(() => ['All', ...Object.keys(SKILL_CATEGORIES)], []);

  // Filter suggestion list based on category & search term
  const displayedSuggestions = useMemo(() => {
    let pool = [];
    if (activeCategory === 'All') {
      Object.values(SKILL_CATEGORIES).forEach(list => pool.push(...list));
    } else {
      pool = SKILL_CATEGORIES[activeCategory] || [];
    }

    // Deduplicate pool
    const uniquePool = Array.from(new Set(pool));

    if (!searchTerm.trim()) {
      return uniquePool;
    }
    const term = searchTerm.trim().toLowerCase();
    return uniquePool.filter(s => s.toLowerCase().includes(term));
  }, [activeCategory, searchTerm]);

  // Case-insensitive check if skill is selected
  const isSelected = (skill) => {
    return selectedSkills.some(s => s.toLowerCase() === skill.toLowerCase());
  };

  const handleToggleSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    if (isSelected(trimmed)) {
      onChange(selectedSkills.filter(s => s.toLowerCase() !== trimmed.toLowerCase()));
    } else {
      onChange([...selectedSkills, trimmed]);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(selectedSkills.filter(s => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  const handleAddCustomSkill = (e) => {
    if (e) e.preventDefault();
    setCustomSkillError('');
    const trimmed = customSkillInput.trim();

    if (!trimmed) {
      setCustomSkillError('Please enter a skill name.');
      return;
    }

    if (isSelected(trimmed)) {
      setCustomSkillError(`"${trimmed}" is already added.`);
      return;
    }

    onChange([...selectedSkills, trimmed]);
    setCustomSkillInput('');
  };

  return (
    <div className="experience-skills-selector" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. Selected Skills Tags Display */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={14} color="#4F46E5" />
            <span>Skills Used ({selectedSkills.length})</span>
          </label>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear all
            </button>
          )}
        </div>

        <div 
          className="subject-tags-container" 
          style={{ minHeight: '44px', background: '#F8FAFC', borderColor: '#E2E8F0', padding: '8px 10px' }}
        >
          {selectedSkills.length === 0 ? (
            <span style={{ fontSize: '12.5px', color: '#94A3B8', fontStyle: 'italic' }}>
              No skills selected yet. Choose from suggestions below or enter a custom skill.
            </span>
          ) : (
            selectedSkills.map((skill, idx) => (
              <span key={idx} className="subject-tag-pill" style={{ background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}>
                <span>{skill}</span>
                <button
                  type="button"
                  className="tag-remove-btn"
                  onClick={() => handleRemoveSkill(skill)}
                  title={`Remove ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 2. Custom Skill Input */}
      <div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Add custom skill (e.g. Next.js, Redux, Playwright)..."
            value={customSkillInput}
            onChange={(e) => {
              setCustomSkillInput(e.target.value);
              if (customSkillError) setCustomSkillError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomSkill();
              }
            }}
            style={{ fontSize: '13px' }}
          />
          <button
            type="button"
            className="btn-wizard-primary"
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
            onClick={handleAddCustomSkill}
          >
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>
        {customSkillError && (
          <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
            {customSkillError}
          </span>
        )}
      </div>

      {/* 3. Category Filter Chips & Live Search */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={14} color="#6366F1" />
            <span>Suggested Skills</span>
          </span>

          {/* Search suggestions */}
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '12px', padding: '4px 26px 4px 8px', height: '30px' }}
            />
            {searchTerm ? (
              <X
                size={13}
                style={{ position: 'absolute', right: '8px', top: '8px', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setSearchTerm('')}
              />
            ) : (
              <Search
                size={13}
                style={{ position: 'absolute', right: '8px', top: '8px', color: '#94A3B8' }}
              />
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: '11.5px',
                padding: '3px 10px',
                borderRadius: '6px',
                border: activeCategory === cat ? '1px solid #4F46E5' : '1px solid #CBD5E1',
                background: activeCategory === cat ? '#4F46E5' : '#FFFFFF',
                color: activeCategory === cat ? '#FFFFFF' : '#475569',
                fontWeight: activeCategory === cat ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Suggestion Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
          {displayedSuggestions.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
              No suggested skills match "{searchTerm}". Use "Add custom skill" above!
            </span>
          ) : (
            displayedSuggestions.map(skill => {
              const active = isSelected(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: active ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                    background: active ? '#EEF2FF' : '#FFFFFF',
                    color: active ? '#4F46E5' : '#334155',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{active ? '✓' : '+'}</span>
                  <span>{skill}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, Check, Plus } from 'lucide-react';
import { CATEGORIZED_SKILLS, OTHER_OPTION } from '../data/skillsData';

const SkillSelect = ({ selectedSkills = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSkill = (skill) => {
    if (skill === OTHER_OPTION) {
      setShowCustomInput(true);
      setIsOpen(false);
      return;
    }

    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    onChange(newSkills);
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      onChange([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
      setShowCustomInput(false);
    }
  };

  const removeSkill = (skill) => {
    onChange(selectedSkills.filter(s => s !== skill));
  };

  const filteredCategories = CATEGORIZED_SKILLS.map(cat => ({
    ...cat,
    skills: cat.skills.filter(s => s.toLowerCase().includes(search.toLowerCase()))
  })).filter(cat => cat.skills.length > 0);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Selected Skills Display */}
      <div 
        className="min-h-[48px] p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-2 cursor-text focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all"
        onClick={() => setIsOpen(true)}
      >
        {selectedSkills.length === 0 && !isOpen && (
          <span className="text-slate-400 text-sm ml-2 self-center">Select skills...</span>
        )}
        
        {selectedSkills.map(skill => (
          <motion.span 
            key={skill}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-lg border border-brand-primary/10"
          >
            {skill}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
              className="hover:bg-brand-primary/20 rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </motion.span>
        ))}

        <input 
          type="text"
          className="bg-transparent border-none outline-none text-sm flex-1 min-w-[120px] h-8"
          placeholder={selectedSkills.length > 0 ? "" : "Search skills..."}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        
        <ChevronDown 
          size={18} 
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''} ml-auto self-center`} 
        />
      </div>

      {/* Custom Skill Input Field */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 flex gap-2 overflow-hidden"
          >
            <input 
              type="text"
              autoFocus
              className="input-field flex-1 !h-10"
              placeholder="Type your custom skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            />
            <button 
              type="button"
              onClick={addCustomSkill}
              className="btn-primary !h-10 !px-4"
            >
              <Plus size={18} />
            </button>
            <button 
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[400px] flex flex-col"
          >
            <div className="overflow-y-auto p-2 custom-scrollbar">
              {filteredCategories.map(cat => (
                <div key={cat.category} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-lg mb-1">
                    <span>{cat.icon}</span>
                    <span>{cat.category}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {cat.skills.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all text-left ${
                            isSelected 
                              ? 'bg-brand-primary text-white font-medium shadow-md shadow-brand-primary/20' 
                              : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                          }`}
                        >
                          <span className="truncate">{skill}</span>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Other Option */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleSkill(OTHER_OPTION)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-primary font-bold hover:bg-brand-primary/5 rounded-xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={18} />
                  </div>
                  {OTHER_OPTION}
                </button>
              </div>

              {filteredCategories.length === 0 && search && (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm mb-4">No predefined skills match "{search}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSkill(search);
                      setShowCustomInput(true);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="btn-primary"
                  >
                    Add "{search}" as custom skill
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillSelect;

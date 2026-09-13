import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Dumbbell, Home, Sparkles, Target } from 'lucide-react'
import './App.css'

type OnboardingViewProps = {
  onComplete: (profile: { goal: string; environment: string; availableDays: number }) => void
  onCancel: () => void
}
const steps = ['Your goal', 'Your setup', 'Your rhythm']

export function OnboardingView({ onComplete, onCancel }: OnboardingViewProps) {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('Fat loss')
  const [setup, setSetup] = useState('Home workouts')
  const [days, setDays] = useState('4 days')
  const canContinue = step < steps.length - 1

  return <div className="onboarding-shell">
    <div className="onboarding-top"><button className="brand-row onboarding-brand" onClick={onCancel}><span className="brand-mark"><Sparkles size={18} /></span><span>fitpulse<span className="brand-accent">ai</span></span></button><button className="skip-button" onClick={onCancel}>Exit setup</button></div>
    <div className="onboarding-progress"><span>SET UP YOUR COACH</span><strong>{step + 1} of {steps.length}</strong><div><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div></div>
    <main className="onboarding-content"><div className="onboarding-intro"><span className="onboarding-icon"><Target size={22} /></span><p className="eyebrow">LET'S MAKE IT PERSONAL</p><h1>{step === 0 ? 'What are you working toward?' : step === 1 ? 'Where will you train?' : 'What fits your week?'}</h1><p>{step === 0 ? 'Your goal helps us shape every workout and recommendation.' : step === 1 ? 'We will only suggest exercises that fit your real surroundings.' : 'Consistency starts with a rhythm you can actually keep.'}</p></div>
      {step === 0 && <div className="choice-grid">{['Fat loss', 'Build muscle', 'Get stronger', 'General fitness'].map((item) => <ChoiceCard key={item} selected={goal === item} onClick={() => setGoal(item)} icon={<Target size={20} />} label={item} description={item === 'Fat loss' ? 'Build sustainable habits' : item === 'Build muscle' ? 'Grow with progressive training' : item === 'Get stronger' ? 'Improve your key lifts' : 'Move and feel better'} />)}</div>}
      {step === 1 && <div className="choice-grid two-column">{[['Home workouts', 'Minimal equipment is enough', Home], ['Gym training', 'Full access to equipment', Dumbbell]].map(([label, description, Icon]) => <ChoiceCard key={label as string} selected={setup === label} onClick={() => setSetup(label as string)} icon={<Icon size={20} />} label={label as string} description={description as string} />)}</div>}
      {step === 2 && <div className="choice-grid rhythm-grid">{['3 days', '4 days', '5 days'].map((item) => <ChoiceCard key={item} selected={days === item} onClick={() => setDays(item)} icon={<span className="day-number">{item[0]}</span>} label={item} description={item === '3 days' ? 'A focused, flexible rhythm' : item === '4 days' ? 'A balanced training week' : 'More volume and variety'} />)}</div>}
      <div className="onboarding-actions"><button className="back-button" onClick={() => step === 0 ? onCancel() : setStep(step - 1)}><ArrowLeft size={16} /> {step === 0 ? 'Back' : 'Previous'}</button>{canContinue ? <button className="primary-action" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={16} /></button> : <button className="primary-action" onClick={() => onComplete({ goal, environment: setup, availableDays: Number.parseInt(days, 10) || 4 })}>Create my plan <Check size={16} /></button>}</div>
    </main>
  </div>
}

function ChoiceCard({ selected, onClick, icon, label, description }: { selected: boolean; onClick: () => void; icon: React.ReactNode; label: string; description: string }) {
  return <button className={`choice-card ${selected ? 'selected' : ''}`} onClick={onClick}><span className="choice-icon">{icon}</span><span><strong>{label}</strong><small>{description}</small></span><i className="choice-check">{selected && <Check size={13} />}</i></button>
}

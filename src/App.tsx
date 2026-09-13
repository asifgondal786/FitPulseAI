import { useEffect, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowUpRight,
  Bell,
  Bot,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Dumbbell,
  Flame,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Target,
  TrendingDown,
  Utensils,
  X,
  Zap,
} from 'lucide-react'
import './App.css'
import { OnboardingView } from './OnboardingView'
import { CoachView, NutritionView, ProgressView, SettingsView } from './WorkspaceViews'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

type NavItem = 'Overview' | 'My plan' | 'Nutrition' | 'Progress' | 'Coach' | 'Settings'

const navItems: Array<{ label: NavItem; icon: typeof LayoutDashboard }> = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My plan', icon: CalendarDays },
  { label: 'Nutrition', icon: Utensils },
  { label: 'Progress', icon: TrendingDown },
  { label: 'Coach', icon: MessageCircle },
]

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((payload as { error?: string }).error || 'Request failed')
  }

  return payload as T
}

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('Overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [workoutDone, setWorkoutDone] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authForm, setAuthForm] = useState({
    name: 'Jordan Davis',
    email: 'jordan@example.com',
    password: 'StrongPass123',
  })
  const [session, setSession] = useState<{
    token: string
    user: { id: string; name: string; email: string; profile?: { goal?: string; environment?: string; availableDays?: number } }
  } | null>(() => {
    const savedToken = typeof window !== 'undefined' ? window.localStorage.getItem('fitpulse-token') : null
    return savedToken ? { token: savedToken, user: { id: '', name: 'Jordan Davis', email: 'jordan@example.com' } } : null
  })

  const currentUser = session?.user
  const token = session?.token

  useEffect(() => {
    if (!token) return

    void apiRequest<{ user: typeof currentUser }>('/api/me', { method: 'GET' }, token)
      .then(({ user }) => {
        setSession((previous) => (previous ? { ...previous, user: user || previous.user } : previous))
      })
      .catch(() => {
        window.localStorage.removeItem('fitpulse-token')
        setSession(null)
      })
  }, [token])

  const handleAuth = async () => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const path = authMode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = authMode === 'register'
        ? { name: authForm.name, email: authForm.email, password: authForm.password }
        : { email: authForm.email, password: authForm.password }

      const response = await apiRequest<{
        token: string
        user: { id: string; name: string; email: string; profile?: { goal?: string; environment?: string; availableDays?: number } }
      }>(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const nextSession = { token: response.token, user: response.user }
      setSession(nextSession)
      window.localStorage.setItem('fitpulse-token', response.token)

      if (!response.user.profile || !response.user.profile.goal) {
        setOnboardingOpen(true)
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in right now.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleOnboardingComplete = async (profile: { goal: string; environment: string; availableDays: number }) => {
    if (!token) return

    try {
      const response = await apiRequest<{ profile: { goal: string; environment: string; availableDays: number } }>('/api/me/profile', {
        method: 'PUT',
        body: JSON.stringify({
          goal: profile.goal,
          environment: profile.environment,
          availableDays: profile.availableDays,
        }),
      }, token)

      setSession((previous) => (previous ? { ...previous, user: { ...previous.user, profile: response.profile } } : previous))
      setOnboardingOpen(false)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to save your profile right now.')
    }
  }

  const handleCoachMessage = async (message: string) => {
    if (!token) return 'Please sign in to chat with your coach.'

    const response = await apiRequest<{ message: string }>('/api/coach/messages', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }, token)

    return response.message
  }

  const handleNav = (label: NavItem) => {
    setActiveNav(label)
    setMobileNavOpen(false)
  }

  if (!session) {
    return (
      <div className={`app-shell ${darkMode ? 'dark-mode' : ''}`}>
        <div className="auth-shell">
          <div className="auth-card">
            <div className="brand-row auth-brand">
              <div className="brand-mark"><Sparkles size={18} /></div>
              <span>fitpulse<span className="brand-accent">ai</span></span>
            </div>
            <p className="eyebrow">WELCOME BACK</p>
            <h1>{authMode === 'login' ? 'Sign in to your plan' : 'Create your account'}</h1>
            <p className="subhead">Your AI coach, plans, and progress are synced to the live backend.</p>

            {authMode === 'register' && (
              <label className="auth-field">
                <span>Name</span>
                <input value={authForm.name} onChange={(event) => setAuthForm((form) => ({ ...form, name: event.target.value }))} />
              </label>
            )}
            <label className="auth-field">
              <span>Email</span>
              <input type="email" value={authForm.email} onChange={(event) => setAuthForm((form) => ({ ...form, email: event.target.value }))} />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input type="password" value={authForm.password} onChange={(event) => setAuthForm((form) => ({ ...form, password: event.target.value }))} />
            </label>

            {authError && <div className="auth-error">{authError}</div>}

            <button className="primary-action auth-submit" onClick={() => void handleAuth()} disabled={authLoading}>
              {authLoading ? 'Working…' : authMode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            <button
              className="text-button switch-auth"
              onClick={() => {
                setAuthMode((mode) => (mode === 'login' ? 'register' : 'login'))
                setAuthError('')
              }}
            >
              {authMode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`app-shell ${darkMode ? 'dark-mode' : ''}`}>
      <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <span>fitpulse<span className="brand-accent">ai</span></span>
          <button className="icon-button close-nav" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>

        <button className="profile-mini" onClick={() => setOnboardingOpen(true)}>
          <div className="avatar">{currentUser?.name?.slice(0, 2).toUpperCase() || 'JD'}</div>
          <div>
            <strong>{currentUser?.name || 'Jordan Davis'}</strong>
            <span>{currentUser?.profile?.goal || 'Fat loss journey'}</span>
          </div>
          <MoreHorizontal size={18} className="muted-icon" />
        </button>

        <nav aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => handleNav(label)}>
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Coach' && <span className="new-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-icon"><Flame size={18} /></div>
            <div><strong>12 day streak</strong><span>Keep your rhythm going</span></div>
            <ChevronRight size={16} />
          </div>

          <button className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`} onClick={() => handleNav('Settings')}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button className="theme-toggle" onClick={() => setDarkMode((mode) => !mode)} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
            <span>{darkMode ? <Sun size={16} /> : <Moon size={16} />}</span>
            <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
            <i className={darkMode ? 'is-dark' : ''}><b /></i>
          </button>

          <div className="sidebar-footer"><span className="status-dot" /> All systems healthy</div>
        </div>
      </aside>

      {onboardingOpen ? (
        <OnboardingView onComplete={handleOnboardingComplete} onCancel={() => setOnboardingOpen(false)} />
      ) : (
        <main className="main-content">
          <header className="topbar">
            <button className="icon-button menu-button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{activeNav}</strong>
            </div>
            <div className="top-actions">
              <button className="icon-button" aria-label="Notifications">
                <Bell size={19} />
                <span className="notification-dot" />
              </button>
              <div className="top-avatar">{currentUser?.name?.slice(0, 2).toUpperCase() || 'JD'}</div>
            </div>
          </header>

          {activeNav === 'My plan' ? (
            <PlanView workoutDone={workoutDone} onComplete={async () => {
              if (!token) return
              await apiRequest('/api/workouts/workout-4/complete', { method: 'POST', body: JSON.stringify({ source: 'plan-view' }) }, token)
              setWorkoutDone(true)
            }} onBack={() => handleNav('Overview')} />
          ) : activeNav === 'Nutrition' ? (
            <NutritionView onBack={() => handleNav('Overview')} token={token || ''} />
          ) : activeNav === 'Progress' ? (
            <ProgressView onBack={() => handleNav('Overview')} token={token || ''} />
          ) : activeNav === 'Coach' ? (
            <CoachView onBack={() => handleNav('Overview')} token={token || ''} onSendMessage={handleCoachMessage} />
          ) : activeNav === 'Settings' ? (
            <SettingsView onBack={() => handleNav('Overview')} token={token || ''} darkMode={darkMode} onToggleDark={() => setDarkMode((mode) => !mode)} />
          ) : (
            <div className="content-wrap">
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">THURSDAY, SEPTEMBER 11, 2026</p>
                  <h1>Good morning, {currentUser?.name?.split(' ')[0] || 'Jordan'} <span className="wave">✦</span></h1>
                  <p className="subhead">Small steps today. Stronger you tomorrow.</p>
                </div>
                <button className="date-button"><CalendarDays size={17} /> This week <ChevronRight size={16} /></button>
              </section>

              <div className="stats-grid">
                <StatCard icon={<Flame size={19} />} label="Current streak" value="12 days" detail="Best: 18 days" tone="orange" />
                <StatCard icon={<Dumbbell size={19} />} label="Workouts this week" value={workoutDone ? '4 / 4' : '3 / 4'} detail={workoutDone ? 'Weekly goal complete' : '1 more to hit your goal'} tone="green" />
                <StatCard icon={<Target size={19} />} label="Goal progress" value="68%" detail="On track for October" tone="blue" progress={68} />
                <StatCard icon={<Zap size={19} />} label="Energy today" value="Good" detail="Based on your check-in" tone="purple" />
              </div>

              <div className="dashboard-grid">
                <section className="panel plan-panel">
                  <div className="panel-heading">
                    <div><span className="section-kicker">YOUR PLAN</span><h2>Today's focus</h2></div>
                    <button className="text-button" onClick={() => handleNav('My plan')}>View full plan <ArrowUpRight size={15} /></button>
                  </div>

                  <div className="focus-card">
                    <div className="focus-art">
                      <div className="ring ring-one" />
                      <div className="ring ring-two" />
                      <Dumbbell size={34} />
                    </div>
                    <div className="focus-copy">
                      <span className="pill green-pill">UP NEXT · 35 MIN</span>
                      <h3>Lower body strength</h3>
                      <p>Build power and stability with a focused lower body session.</p>
                      <div className="exercise-meta"><span><Activity size={14} /> 6 exercises</span><span><Zap size={14} /> Moderate</span></div>
                    </div>
                    <button className="play-button" onClick={() => setWorkoutDone(true)} aria-label="Start workout"><ChevronRight size={22} /></button>
                  </div>

                  <div className="plan-list">
                    <PlanRow name="Dynamic warm-up" time="5 min" complete />
                    <PlanRow name="Goblet squat" time="3 sets × 10" />
                    <PlanRow name="Reverse lunge" time="3 sets × 8" />
                    <PlanRow name="Cooldown & stretch" time="5 min" />
                  </div>
                </section>

                <section className="panel coach-panel">
                  <div className="panel-heading">
                    <div><span className="section-kicker">YOUR COACH</span><h2>A note for you</h2></div>
                    <div className="coach-status"><span className="status-dot" /> Online</div>
                  </div>

                  <div className="coach-message">
                    <div className="coach-icon"><Bot size={21} /></div>
                    <div>
                      <p>You've been consistent this week, Jordan. Let's make today's session count, but listen to your body.</p>
                      <span>Coach Nova · 2 min ago</span>
                    </div>
                  </div>

                  <button className="coach-cta" onClick={() => handleNav('Coach')}><MessageCircle size={17} /> Talk to your coach <ArrowUpRight size={15} /></button>
                  <div className="quick-prompts">
                    <button onClick={() => handleNav('Coach')}>I'm feeling tired</button>
                    <button onClick={() => handleNav('Coach')}>Swap an exercise</button>
                  </div>
                </section>

                <section className="panel progress-panel">
                  <div className="panel-heading">
                    <div><span className="section-kicker">PROGRESS</span><h2>Weight trend</h2></div>
                    <button className="more-button" aria-label="More progress options"><MoreHorizontal size={18} /></button>
                  </div>
                  <div className="metric-row">
                    <div>
                      <strong>74.2 <small>kg</small></strong>
                      <span className="positive"><TrendingDown size={14} /> 1.8 kg this month</span>
                    </div>
                    <span className="range-label">Last 30 days</span>
                  </div>
                  <div className="chart-wrap">
                    <div className="chart-grid"><span>76</span><span>75</span><span>74</span><span>73</span></div>
                    <svg viewBox="0 0 620 150" preserveAspectRatio="none" className="line-chart" role="img" aria-label="Weight trending down over the last 30 days">
                      <defs>
                        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#b8e7d1" stopOpacity=".45" />
                          <stop offset="100%" stopColor="#b8e7d1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path className="area" d="M0,45 C45,50 60,30 100,53 S160,48 190,70 S250,40 285,65 S345,80 380,92 S435,70 465,95 S530,92 570,116 S600,105 620,115 L620,150 L0,150 Z" />
                      <path className="chart-line" d="M0,45 C45,50 60,30 100,53 S160,48 190,70 S250,40 285,65 S345,80 380,92 S435,70 465,95 S530,92 570,116 S600,105 620,115" />
                      <circle cx="570" cy="116" r="5" className="chart-point" />
                    </svg>
                  </div>
                  <div className="chart-dates"><span>Aug 12</span><span>Aug 22</span><span>Sep 1</span><span>Sep 11</span></div>
                </section>

                <section className="panel nutrition-panel">
                  <div className="panel-heading">
                    <div><span className="section-kicker">NUTRITION</span><h2>Today's intake</h2></div>
                    <button className="text-button" onClick={() => handleNav('Nutrition')}>Log food <Plus size={15} /></button>
                  </div>
                  <div className="nutrition-summary">
                    <div className="calorie-ring"><div><strong>1,240</strong><span>of 1,850 kcal</span></div></div>
                    <div className="macro-list">
                      <Macro label="Protein" current="94g" total="140g" color="protein" percentage={67} />
                      <Macro label="Carbs" current="128g" total="210g" color="carbs" percentage={61} />
                      <Macro label="Fats" current="38g" total="62g" color="fats" percentage={61} />
                    </div>
                  </div>
                  <button className="log-meal" onClick={() => handleNav('Nutrition')}><Plus size={16} /> Add a meal</button>
                </section>
              </div>
            </div>
          )}
        </main>
      )}

      <div className={`mobile-overlay ${mobileNavOpen ? 'visible' : ''}`} onClick={() => setMobileNavOpen(false)} />
    </div>
  )
}

function StatCard({ icon, label, value, detail, tone, progress }: { icon: ReactNode; label: string; value: string; detail: string; tone: string; progress?: number }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{progress ? <span className="mini-progress"><i style={{ width: `${progress}%` }} /></span> : null}{detail}</small>
      </div>
    </div>
  )
}

function PlanRow({ name, time, complete }: { name: string; time: string; complete?: boolean }) {
  return (
    <div className="plan-row">
      <span className={`check-circle ${complete ? 'complete' : ''}`}>{complete && <CircleCheck size={15} />}</span>
      <span className="exercise-name">{name}</span>
      <span className="exercise-time">{time}</span>
      <ChevronRight size={15} className="muted-icon" />
    </div>
  )
}

function Macro({ label, current, total, color, percentage }: { label: string; current: string; total: string; color: string; percentage: number }) {
  return (
    <div className="macro">
      <div className="macro-top">
        <span><i className={`macro-dot ${color}`} />{label}</span>
        <strong>{current} <small>/ {total}</small></strong>
      </div>
      <div className="macro-track"><i className={color} style={{ width: `${percentage}%` }} /></div>
    </div>
  )
}

function PlanView({ workoutDone, onComplete, onBack }: { workoutDone: boolean; onComplete: () => void | Promise<void>; onBack: () => void }) {
  return (
    <div className="content-wrap plan-view">
      <button className="back-button" onClick={onBack}><ChevronRight size={16} className="back-arrow" /> Back to overview</button>
      <div className="plan-view-heading">
        <div>
          <p className="eyebrow">WEEK OF SEPTEMBER 7, 2026</p>
          <h1>Your training plan</h1>
          <p className="subhead">A steady week built around your energy, goal, and schedule.</p>
        </div>
        <button className="date-button"><CalendarDays size={17} /> Edit schedule</button>
      </div>

      <div className="week-strip">
        {['MON 7', 'TUE 8', 'WED 9', 'THU 10', 'FRI 11', 'SAT 12', 'SUN 13'].map((day, index) => (
          <div className={`day-cell ${index === 4 ? 'today' : ''} ${index < 4 ? 'complete-day' : ''}`} key={day}>
            <span>{day.split(' ')[0]}</span>
            <strong>{day.split(' ')[1]}</strong>
            {index < 4 && <CircleCheck size={13} />}
            {index === 4 && <i />}
          </div>
        ))}
      </div>

      <div className="plan-detail-grid">
        <section className="panel workout-detail">
          <div className="panel-heading">
            <div>
              <span className="pill green-pill">TODAY · 35 MIN</span>
              <h2>Lower body strength</h2>
              <p className="detail-subtitle">Thursday, September 11 · Moderate intensity</p>
            </div>
            <div className="detail-badge"><Dumbbell size={17} /> Strength</div>
          </div>

          <div className="detail-summary">
            <span><Activity size={15} /> 6 exercises</span>
            <span><Zap size={15} /> Moderate</span>
            <span>~180 kcal</span>
          </div>

          <div className="exercise-table">
            <ExerciseDetail name="Dynamic warm-up" description="Prepare your hips, knees, and ankles" sets="5 min" status="complete" />
            <ExerciseDetail name="Goblet squat" description="Keep your chest tall and drive through your feet" sets="3 × 10" />
            <ExerciseDetail name="Reverse lunge" description="Step back softly and keep your front knee stable" sets="3 × 8 / side" />
            <ExerciseDetail name="Glute bridge" description="Squeeze at the top without arching your back" sets="3 × 12" />
            <ExerciseDetail name="Cooldown & stretch" description="Breathe slowly through each position" sets="5 min" />
          </div>

          <button className={`complete-workout ${workoutDone ? 'done' : ''}`} onClick={onComplete}>{workoutDone ? 'Workout complete' : 'Mark workout complete'}</button>
        </section>

        <aside className="panel next-panel">
          <div className="panel-heading">
            <div><span className="section-kicker">NEXT UP</span><h2>Recovery focus</h2></div>
          </div>
          <div className="mini-plan-line"><span>Recovery flow</span><strong>20 min</strong></div>
          <div className="plan-note">
            <strong>Coach note</strong>
            <p>Prioritize movement quality and keep recovery light after today's strength work.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ExerciseDetail({ name, description, sets, status }: { name: string; description: string; sets: string; status?: string }) {
  return (
    <div className="exercise-detail">
      <span className={`exercise-status ${status === 'complete' ? 'complete' : ''}`}>{status === 'complete' && <CircleCheck size={14} />}</span>
      <div>
        <strong>{name}</strong>
        <p>{description}</p>
      </div>
      <span className="exercise-sets">{sets}</span>
      <ChevronRight size={16} className="muted-icon" />
    </div>
  )
}

export default App

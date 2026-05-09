import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FaClipboardList, FaCheckCircle, FaFileAlt, FaEye, FaPen, FaPlus, FaTrash, FaUsers } from 'react-icons/fa'
import { createColumnHelper } from '@tanstack/react-table'
import { RowActions } from '../../components/ui/RowActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import DashboardTopBar from '../../components/common/DashboardTopBar'
import { DataTable } from '../../components/ui/DataTable'
import institutionLogo from '../../assets/Logo_4.png'
import { getFeedbackForms, deleteFeedbackForm } from '../../services/feedback'

const columnHelper = createColumnHelper()

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
        <Icon className="text-sm text-white/90" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-white">{value}</p>
        <p className="mt-0.5 text-[11px] font-medium text-white/60">{label}</p>
      </div>
    </div>
  )
}

const TYPE_COLORS = {
  Exam:   'bg-violet-50 border-violet-100 text-violet-700',
  Lab:    'bg-sky-50 border-sky-100 text-sky-700',
  Course: 'bg-amber-50 border-amber-100 text-amber-700',
  Custom: 'bg-slate-50 border-slate-200 text-slate-600',
}

function FeedbackFormsPage() {
  const navigate = useNavigate()
  const [authState] = useState(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return { user: null }
    try { return { user: JSON.parse(storedUser) } }
    catch { return { user: null } }
  })
  const [forms, setForms]               = useState([])
  const [isLoading, setIsLoading]       = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    const allowed = ['institution_admin', 'coordinator', 'lecturer']
    if (!allowed.includes(authState.user.role)) navigate('/')
  }, [authState.user, navigate])

  useEffect(() => {
    if (!authState.user) return
    setIsLoading(true)
    getFeedbackForms()
      .then((data) => setForms(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load feedback forms.'))
      .finally(() => setIsLoading(false))
  }, [authState.user])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  const handleSidebarNavigation = useCallback((key) => {
    if (key === 'invite') { navigate('/manage-users', { state: { openInvite: true } }); return }
    const routeMap = {
      dashboard: '/institution-dashboard',
      courses:   '/courses',
      feedback:  '/feedback-forms',
      users:     '/manage-users',
    }
    const route = routeMap[key]
    if (route) navigate(route)
  }, [navigate])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteFeedbackForm(deleteTarget.id)
      setForms((prev) => prev.filter((f) => f.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.title}" deleted successfully.`)
    } catch {
      toast.error('Failed to delete form.')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const stats = useMemo(() => ({
    total:     forms.length,
    published: forms.filter((f) => f.status === 'published').length,
    drafts:    forms.filter((f) => f.status === 'draft').length,
  }), [forms])

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Form Title',
      cell: (info) => (
        <p className="font-semibold text-[#124f2f]">{info.getValue()}</p>
      ),
    }),
    columnHelper.accessor('form_type', {
      header: 'Type',
      cell: (info) => {
        const t = info.getValue()
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[t] ?? TYPE_COLORS.Custom}`}>
            {t}
          </span>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const s = info.getValue()
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            s === 'published'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-amber-50 border-amber-100 text-amber-700'
          }`}>
            {s === 'published' ? 'Published' : 'Draft'}
          </span>
        )
      },
    }),
    columnHelper.accessor('question_count', {
      header: 'Questions',
      cell: (info) => (
        <span className="text-sm font-semibold text-slate-700">{info.getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: 'responses',
      header: 'Responses',
      cell: ({ row }) => {
        const { response_count, distributed_count } = row.original
        return (
          <div className="flex items-center gap-1.5">
            <FaUsers className="text-xs text-slate-400" />
            <span className="text-sm font-semibold text-[#13462D]">{response_count}</span>
            <span className="text-xs text-slate-400">/ {distributed_count}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: (info) => (
        <span className="text-xs text-slate-400">
          {new Date(info.getValue()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const form = row.original
        return (
          <RowActions actions={[
            { label: 'View',   icon: FaEye,   onClick: () => navigate('/feedbackForm', { state: { mode: 'view', formId: form.id } }) },
            { label: 'Edit',   icon: FaPen,   onClick: () => navigate('/feedbackForm', { state: { mode: 'edit', formId: form.id } }) },
            { label: 'Delete', icon: FaTrash, variant: 'danger', onClick: () => setDeleteTarget({ id: form.id, title: form.title }) },
          ]} />
        )
      },
    }),
  ], [navigate])

  if (!authState.user) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <DashboardSidebar
        activeNav="feedback"
        onNavChange={handleSidebarNavigation}
        onLogout={handleLogout}
        logoSrc={institutionLogo}
        logoAlt="ThinkBack logo"
      />

      <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
        <DashboardTopBar
          userName={authState.user.full_name}
          userEmail={authState.user.email}
          searchPlaceholder="Search feedback forms"
        />

        {/* ── Hero banner ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-8 md:px-10 md:py-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-white/[0.03]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">
                  Feedback Management
                </p>
                <h1 className="text-3xl font-bold text-white md:text-4xl">Feedback Forms</h1>
                <p className="mt-2 max-w-md text-sm text-white/60">
                  Build and distribute feedback questionnaires for courses, exams, and labs.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <StatPill icon={FaClipboardList} label="Total Forms"    value={stats.total} />
                  <StatPill icon={FaCheckCircle}   label="Published"      value={stats.published} />
                  <StatPill icon={FaFileAlt}        label="Drafts"         value={stats.drafts} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/feedbackForm', { state: { mode: 'create' } })}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#13462D] shadow-lg transition hover:bg-emerald-50 lg:self-auto"
              >
                <FaPlus className="text-xs" />
                Create Form
              </button>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="rounded-[32px] bg-white shadow-md px-6 py-12 text-center text-sm text-slate-400">
                Loading forms…
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={forms}
                searchPlaceholder="Search by title, type…"
                pageSize={8}
              />
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Form"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? All questions will be removed.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default FeedbackFormsPage

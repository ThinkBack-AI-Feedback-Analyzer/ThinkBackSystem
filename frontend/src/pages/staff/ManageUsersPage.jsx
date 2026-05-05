import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FaEnvelope, FaPen, FaTrash } from 'react-icons/fa'
import { RowActions } from '../../components/ui/RowActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { createColumnHelper } from '@tanstack/react-table'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import DashboardTopBar from '../../components/common/DashboardTopBar'
import InviteUserModal from '../../components/modals/InviteUserModal'
import EditStaffModal from '../../components/modals/EditStaffModal'
import { DataTable } from '../../components/ui/DataTable'
import institutionLogo from '../../assets/Logo_4.png'
import { getInstitutionUsers, resendInvitation, deleteStaff } from '../../services/users'

const ROLE_BADGE = {
  lecturer:    'bg-sky-50 text-sky-700 border-sky-200',
  coordinator: 'bg-amber-50 text-amber-700 border-amber-200',
}

const STATUS_BADGE = {
  Active:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Invited: 'bg-slate-100 text-slate-500 border-slate-200',
}

const columnHelper = createColumnHelper()

function ManageUsersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authState] = useState(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return { user: null }
    try { return { user: JSON.parse(storedUser) } }
    catch { return { user: null } }
  })

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [isModalOpen, setIsModalOpen]   = useState(() => location.state?.openInvite === true)
  const [editingUser, setEditingUser]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, full_name }
  const [resendingId, setResendingId]   = useState(null)
  const [deletingId, setDeletingId]     = useState(null)

  useEffect(() => {
    if (!authState.user) { navigate('/login'); return }
    if (authState.user.role !== 'institution_admin') navigate('/')
  }, [authState.user, navigate])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setFetchError('')
    try {
      const data = await getInstitutionUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setFetchError('Failed to load staff members.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authState.user) fetchUsers()
  }, [authState.user, fetchUsers])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  const handleSidebarNavigation = useCallback((key) => {
    if (key === 'invite') { setIsModalOpen(true); return }
    const routeMap = {
      dashboard: '/institution-dashboard',
      courses: '/courses',
      feedback: '/feedback-forms',
      users: '/manage-users',
    }
    const route = routeMap[key]
    if (route) navigate(route)
  }, [navigate])

  const handleResend = useCallback(async (userId) => {
    setResendingId(userId)
    try {
      await resendInvitation(userId)
      toast.success('Invitation resent successfully.')
    } catch {
      toast.error('Failed to resend invitation.')
    } finally {
      setResendingId(null)
    }
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    try {
      await deleteStaff(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.full_name}" removed successfully.`)
    } catch {
      toast.error('Failed to remove staff member.')
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const handleInviteSuccess = useCallback(() => {
    setIsModalOpen(false)
    fetchUsers()
    toast.success('Invitation sent successfully.')
  }, [fetchUsers])

  const columns = useMemo(() => [
    columnHelper.accessor('full_name', {
      header: 'Full Name',
      cell: (info) => (
        <span className="font-semibold text-[#124f2f]">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <span className="text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => {
        const role = info.getValue()
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[role] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {role}
          </span>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {status}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original
        const actions = [
          {
            label: 'Edit',
            icon: FaPen,
            onClick: () => setEditingUser(user),
          },
          ...(user.status === 'Invited'
            ? [{
                label: resendingId === user.id ? 'Sending…' : 'Resend Invite',
                icon: FaEnvelope,
                disabled: resendingId === user.id,
                onClick: () => handleResend(user.id),
              }]
            : []),
          {
            label: deletingId === user.id ? 'Deleting…' : 'Delete',
            icon: FaTrash,
            variant: 'danger',
            disabled: deletingId === user.id,
            onClick: () => setDeleteTarget({ id: user.id, full_name: user.full_name }),
          },
        ]
        return <RowActions actions={actions} />
      },
    }),
  ], [handleResend, handleDeleteConfirm, resendingId, deletingId])

  if (!authState.user) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <DashboardSidebar
        activeNav="users"
        onNavChange={handleSidebarNavigation}
        onLogout={handleLogout}
        logoSrc={institutionLogo}
        logoAlt="ThinkBack logo"
      />

      <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
        <DashboardTopBar
          userName={authState.user.full_name}
          userEmail={authState.user.email}
          searchPlaceholder="Search staff"
        />

        <section className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="mx-auto mb-5 flex max-w-7xl flex-col gap-4 rounded-[24px] border border-[#d8e7dd] bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#124f2f] md:text-3xl">Staff Management</h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Add and manage staff members — coordinators and lecturers — in your institution.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[#13462D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26]"
            >
              + Add Staff
            </button>
          </div>

          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="rounded-[32px] bg-white shadow-md px-6 py-12 text-center text-sm text-slate-400">
                Loading staff members…
              </div>
            ) : fetchError ? (
              <div className="rounded-[32px] bg-white shadow-md px-6 py-12 text-center text-sm text-red-500">
                {fetchError}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={users}
                searchPlaceholder="Search by name, email, role…"
                pageSize={10}
              />
            )}
          </div>
        </section>
      </main>

      <InviteUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />

      <EditStaffModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={() => { setEditingUser(null); fetchUsers(); toast.success('Staff member updated successfully.') }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove Staff Member"
        description={`Are you sure you want to remove "${deleteTarget?.full_name}" from your institution? This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default ManageUsersPage

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FaEnvelope, FaPen, FaPlus, FaTrash, FaUsers, FaUserCheck, FaUserClock } from 'react-icons/fa'
import { RowActions } from '../../components/ui/RowActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { createColumnHelper } from '@tanstack/react-table'
import DashboardLayout from '../../components/common/DashboardLayout'
import InviteUserModal from '../../components/modals/InviteUserModal'
import EditStaffModal from '../../components/modals/EditStaffModal'
import { DataTable } from '../../components/ui/DataTable'
import { getInstitutionUsers, resendInvitation, deleteStaff } from '../../services/users'
import { useCurrentUser } from '../../hooks/useSidebarNav'

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
  const authUser = useCurrentUser()
  const authState = { user: authUser }

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

  const handleBulkDelete = useCallback(async (rows) => {
    await Promise.all(rows.map((r) => deleteStaff(r.id)))
    setUsers((prev) => prev.filter((u) => !rows.some((r) => r.id === u.id)))
    toast.success(`${rows.length} staff member${rows.length > 1 ? 's' : ''} removed.`)
  }, [])

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
    <DashboardLayout activeNav="users">

        {/* ── Hero ── */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 relative overflow-hidden rounded-2xl bg-[#13462D] px-6 py-5 md:px-10 md:py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-white/[0.03]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Staff Management</p>
                <h1 className="text-3xl font-bold text-white md:text-4xl">Manage Staff</h1>
                <p className="mt-2 max-w-md text-sm text-white/60">
                  Add and manage coordinators and lecturers in your institution.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {[
                    { icon: FaUsers,     label: 'Total Staff',   value: users.length },
                    { icon: FaUserCheck, label: 'Active',        value: users.filter((u) => u.status === 'Active').length },
                    { icon: FaUserClock, label: 'Invited',       value: users.filter((u) => u.status === 'Invited').length },
                  ].map((p) => (
                    <div key={p.label} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                        <p.icon className="text-sm text-white/90" />
                      </div>
                      <div>
                        <p className="text-lg font-bold leading-none text-white">{p.value}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-white/60">{p.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#13462D] shadow-lg transition hover:bg-emerald-50 lg:self-auto"
              >
                <FaPlus className="text-xs" />
                Add Staff
              </button>
            </div>
          </div>
        </div>

        <section className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="mx-auto max-w-7xl pt-6">
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
                onDeleteSelected={handleBulkDelete}
              />
            )}
          </div>
        </section>

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
    </DashboardLayout>
  )
}

export default ManageUsersPage

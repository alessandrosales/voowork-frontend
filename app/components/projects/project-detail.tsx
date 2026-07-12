"use client"

import * as React from "react"
import { useNavigate } from "react-router"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  PlusIcon,
  StarIcon,
} from "lucide-react"

import { ProjectsService, TasksService, ApiError } from "~/lib/api"
import type { Project, Task } from "~/lib/api/types"

/* ---------- Drag handle ---------- */

function DragHandle({ id }: { id: UniqueIdentifier }) {
  const { attributes, listeners } = useSortable({ id })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
      aria-label="Arrastar para reordenar"
    >
      <GripVerticalIcon className="size-3.5" />
      <span className="sr-only">Arrastar para reordenar</span>
    </Button>
  )
}

/* ---------- Draggable row ---------- */

function DraggableRow({
  task,
  children,
}: {
  task: Task
  children: React.ReactNode
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: task.id,
  })

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-60"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {children}
    </TableRow>
  )
}

/* ---------- Inline description editor ---------- */

function InlineDescription({
  task,
  onSave,
}: {
  task: Task
  onSave: (taskId: string, description: string) => Promise<void>
}) {
  const [editing, setEditing] = React.useState(false)
  const [value, setValue] = React.useState(task.description ?? "")
  const [saving, setSaving] = React.useState(false)
  const ref = React.useRef<HTMLTextAreaElement>(null)

  // Sync value when task changes (e.g. after external save)
  React.useEffect(() => {
    setValue(task.description ?? "")
  }, [task.description])

  // Focus and select on edit start
  React.useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [editing])

  const handleSave = async () => {
    const trimmed = value.trim()
    // Only save if actually changed
    if (trimmed === (task.description ?? "")) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      await onSave(task.id, trimmed)
      setEditing(false)
    } catch {
      // Revert on error
      setValue(task.description ?? "")
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setValue(task.description ?? "")
      setEditing(false)
    }
    // Ctrl+Enter or Cmd+Enter to save
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  if (editing) {
    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="min-h-0 resize-none px-2 py-1 text-sm"
        rows={2}
        disabled={saving}
        placeholder="Descrição da tarefa..."
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full max-w-[260px] text-left text-sm leading-relaxed text-muted-foreground transition-colors hover:text-foreground cursor-text truncate"
      title={
        task.description
          ? `Clique para editar: ${task.description}`
          : "Clique para adicionar descrição"
      }
    >
      {task.description || (
        <span className="italic text-muted-foreground/40">
          Sem descrição
        </span>
      )}
    </button>
  )
}

interface ProjectDetailProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const navigate = useNavigate()

  // --- Project state ---
  const [project, setProject] = React.useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = React.useState(true)
  const [projectError, setProjectError] = React.useState<string | null>(null)

  // --- Tasks state ---
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = React.useState(true)
  const [tasksError, setTasksError] = React.useState<string | null>(null)

  // --- Task form state ---
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [formName, setFormName] = React.useState("")
  const [formDescription, setFormDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  // --- Delete task state ---
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // --- Featured toggle ---
  const [togglingFeatured, setTogglingFeatured] = React.useState(false)

  // --- Fetch project ---
  const fetchProject = React.useCallback(() => {
    setProjectLoading(true)
    setProjectError(null)
    ProjectsService.get(projectId)
      .then(setProject)
      .catch((err) => {
        if (err instanceof ApiError) {
          setProjectError(err.message)
        } else {
          setProjectError("Erro ao carregar projeto.")
        }
      })
      .finally(() => setProjectLoading(false))
  }, [projectId])

  // --- Fetch tasks ---
  const fetchTasks = React.useCallback(() => {
    setTasksLoading(true)
    setTasksError(null)
    TasksService.listByProject(projectId)
      .then(setTasks)
      .catch((err) => {
        if (err instanceof ApiError) {
          setTasksError(err.message)
        } else {
          setTasksError("Erro ao carregar tarefas.")
        }
      })
      .finally(() => setTasksLoading(false))
  }, [projectId])

  // --- Drag-and-drop reorder ---
  const [isReordering, setIsReordering] = React.useState(false)
  const sortableId = React.useId()
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => tasks.map((t) => t.id),
    [tasks],
  )
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!active || !over || active.id === over.id) return

      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(tasks, oldIndex, newIndex)
      setTasks(reordered)

      // Persist new positions
      setIsReordering(true)
      const updates = reordered.map((task, index) =>
        TasksService.update(task.id, { position: index }),
      )
      Promise.all(updates)
        .then(() => toast.success("Ordem atualizada."))
        .catch(() => {
          toast.error("Erro ao salvar ordem. Recarregando...")
          fetchTasks()
        })
        .finally(() => setIsReordering(false))
    },
    [tasks, fetchTasks],
  )

  // --- Inline description save ---
  const handleSaveDescription = React.useCallback(
    async (taskId: string, description: string) => {
      const updated = await TasksService.update(taskId, { description })
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, description: updated.description } : t)),
      )
    },
    [],
  )

  React.useEffect(() => {
    fetchProject()
    fetchTasks()
  }, [fetchProject, fetchTasks])

  // --- Dialog helpers ---
  const openCreateTaskDialog = () => {
    setEditingTask(null)
    setFormName("")
    setFormDescription("")
    setFormError(null)
    setFormDialogOpen(true)
  }

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task)
    setFormName(task.name)
    setFormDescription(task.description ?? "")
    setFormError(null)
    setFormDialogOpen(true)
  }

  // --- Save task ---
  const handleSaveTask = async () => {
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (editingTask) {
        await TasksService.update(editingTask.id, {
          name: formName,
          description: formDescription || null,
        })
        toast.success("Tarefa atualizada com sucesso.")
      } else {
        await TasksService.create(projectId, {
          name: formName,
          ...(formDescription ? { description: formDescription } : {}),
        })
        toast.success("Tarefa criada com sucesso.")
      }
      setFormDialogOpen(false)
      fetchTasks()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const msgs = Object.entries(err.errors).flatMap(([field, msgs]) =>
            msgs.map((msg) => `${field} ${msg}`),
          )
          setFormError(msgs.join(". "))
        } else {
          setFormError(err.message)
        }
      } else {
        setFormError("Erro de conexão.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Delete task ---
  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    setIsDeleting(true)

    try {
      await TasksService.delete(taskToDelete.id)
      toast.success("Tarefa excluída.")
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
      fetchTasks()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao excluir tarefa.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // --- Toggle featured ---
  const handleToggleFeatured = async () => {
    if (!project) return
    setTogglingFeatured(true)
    try {
      await ProjectsService.update(project.id, {
        featured: !project.featured,
      })
      setProject((prev) =>
        prev ? { ...prev, featured: !prev.featured } : null,
      )
      toast.success(
        project.featured
          ? "Destaque removido."
          : "Projeto destacado.",
      )
    } catch {
      toast.error("Erro ao alterar destaque.")
    } finally {
      setTogglingFeatured(false)
    }
  }

  // --- Combined loading / error ---
  const isLoading = projectLoading
  const hasError = projectError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Carregando projeto...</span>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 lg:px-6">
        <Button
          variant="ghost"
          className="self-start"
          onClick={() => navigate("/projetos")}
        >
          <ArrowLeftIcon />
          <span>Voltar</span>
        </Button>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-destructive">{projectError}</p>
            <Button variant="outline" onClick={fetchProject}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <button
            type="button"
            onClick={handleToggleFeatured}
            disabled={togglingFeatured}
            className={
              "cursor-pointer transition-colors disabled:opacity-50 " +
              (project.featured
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-muted-foreground/30 hover:text-muted-foreground/60")
            }
            title={
              project.featured
                ? "Remover destaque"
                : "Destacar projeto"
            }
          >
            <StarIcon
              className="size-5"
              fill={project.featured ? "currentColor" : "none"}
            />
            <span className="sr-only">
              {project.featured ? "Destacado" : "Não destacado"}
            </span>
          </button>
        </div>
      </div>

      {/* Tasks section */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Tarefas</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projetos")}
            >
              <ArrowLeftIcon />
              <span>Voltar</span>
            </Button>
            <Button size="sm" onClick={openCreateTaskDialog}>
              <PlusIcon />
              <span>Nova Tarefa</span>
            </Button>
          </div>
        </div>

        {/* Tasks error */}
        {tasksError && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-destructive">{tasksError}</p>
              <Button variant="outline" onClick={fetchTasks}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {/* Tasks table */}
        {!tasksError && (
          <div className="overflow-hidden rounded-lg border">
            {tasksLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="ml-2 text-sm">Carregando tarefas...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <p className="text-sm">Nenhuma tarefa encontrada.</p>
                <Button variant="outline" size="sm" onClick={openCreateTaskDialog}>
                  <PlusIcon />
                  <span>Criar primeira tarefa</span>
                </Button>
              </div>
            ) : (
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
                id={sortableId}
              >
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-8">
                        <span className="sr-only">Reordenar</span>
                      </TableHead>
                      <TableHead className="w-8">
                        <span className="sr-only">Ações</span>
                      </TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-full">Descrição</TableHead>
                      <TableHead className="text-right whitespace-nowrap">
                        Data de Criação
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length ? (
                      <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {tasks.map((task) => (
                          <DraggableRow key={task.id} task={task}>
                            <TableCell className="w-8">
                              <DragHandle id={task.id} />
                            </TableCell>
                            <TableCell className="w-8">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                                    size="icon"
                                  >
                                    <EllipsisVerticalIcon />
                                    <span className="sr-only">Abrir menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="w-32"
                                >
                                  <DropdownMenuItem
                                    onClick={() => openEditTaskDialog(task)}
                                  >
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => {
                                      setTaskToDelete(task)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell className="font-medium max-w-[180px] truncate">
                              {task.name}
                            </TableCell>
                            <TableCell className="w-full">
                              <InlineDescription
                                task={task}
                                onSave={handleSaveDescription}
                              />
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                              {new Date(task.created_at).toLocaleDateString(
                                "pt-BR",
                              )}
                            </TableCell>
                          </DraggableRow>
                        ))}
                      </SortableContext>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Nenhuma tarefa encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit task dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Altere o nome da tarefa."
                : "Preencha o nome para criar uma nova tarefa."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="task-name">Nome</FieldLabel>
              <Input
                id="task-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nome da tarefa"
                required
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="task-description">Descrição</FieldLabel>
              <Textarea
                id="task-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição da tarefa (opcional)"
                disabled={isSubmitting}
                rows={3}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveTask} disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : editingTask
                  ? "Salvar"
                  : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete task confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa "
              {taskToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setTaskToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

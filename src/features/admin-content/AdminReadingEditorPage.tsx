import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CategoryId } from '../../content/types';
import { ReadingPage } from '../reading/ReadingPage';
import { getDraftReading, saveDraftReading } from '../../firebase/drafts';
import {
  getPublishedReadingMeta,
  publishDraftReading,
  type PublishedReadingMeta,
} from '../../firebase/publish';
import {
  addBlock,
  createEmptyDraftReading,
  draftToReadingDocument,
  formatRepeat,
  moveBlock,
  normalizeBlocks,
  removeBlock,
  repeatPresets,
  validateDraftReading,
  type DraftBlock,
  type DraftReading,
  generateSlug,
} from './admin-content-model';
import { useAdminSession } from '../auth/useAdminAuth';

type AdminReadingEditorPageProps = {
  readingId: string;
  navigate: (path: string) => void;
};

const categories: Array<{ id: CategoryId; label: string }> = [
  { id: 'ratib', label: 'Ratib' },
  { id: 'tawasul', label: 'Tawasul' },
  { id: 'tahlil', label: 'Tahlil' },
  { id: 'doa', label: 'Doa-doa' },
];

export function AdminReadingEditorPage({ readingId, navigate }: AdminReadingEditorPageProps) {
  const session = useAdminSession();
  const [draft, setDraft] = useState<DraftReading>(() => createEmptyDraftReading());
  const [loading, setLoading] = useState(readingId !== 'new');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedMeta, setPublishedMeta] = useState<PublishedReadingMeta | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (readingId === 'new' || session.status !== 'authorized') {
      setLoading(false);
      return;
    }

    let active = true;
    getDraftReading(readingId)
      .then((nextDraft) => {
        if (!active) return;
        if (nextDraft) {
          setDraft(nextDraft);
        } else {
          setErrors(['Draft tidak ditemukan.']);
        }
      })
      .catch(() => {
        if (active) setErrors(['Gagal memuat draft.']);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [readingId, session.status]);

  useEffect(() => {
    if (session.status !== 'authorized') {
      return;
    }

    let active = true;
    getPublishedReadingMeta(draft.id)
      .then((meta) => {
        if (active) setPublishedMeta(meta);
      })
      .catch(() => {
        if (active) setPublishedMeta(null);
      });

    return () => {
      active = false;
    };
  }, [draft.id, session.status]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const previewDocument = useMemo(() => draftToReadingDocument(draft), [draft]);

  if (session.status === 'loading' || session.status === 'checking-admin' || loading) {
    return <AdminEditorShell title="Memuat editor..." />;
  }

  if (session.status !== 'authorized') {
    return (
      <AdminEditorShell title="Akses admin diperlukan">
        <button className="primary-action" type="button" onClick={() => navigate('/admin/login')}>
          Ke Login Admin
        </button>
      </AdminEditorShell>
    );
  }

  const updateDraft = (updater: (current: DraftReading) => DraftReading) => {
    setDraft((current) => updater(current));
    setDirty(true);
    setMessage(null);
  };

  const handleSave = async () => {
    const validation = validateDraftReading(draft);
    setErrors(validation.errors);
    if (!validation.ok) {
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await saveDraftReading({ ...draft, blocks: normalizeBlocks(draft.blocks) });
      setDirty(false);
      setMessage('Draft tersimpan.');
    } catch {
      setErrors(['Gagal menyimpan draft. Input tidak dihapus.']);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (dirty) {
      setErrors(['Simpan draft terlebih dahulu sebelum publish.']);
      setMessage(null);
      return;
    }

    if (!window.confirm('Publish draft ini ke public reader?')) {
      return;
    }

    setPublishing(true);
    setMessage(null);
    setErrors([]);
    try {
      const meta = await publishDraftReading(draft.id);
      setPublishedMeta(meta);
      setMessage(`Berhasil dipublish. Version ${meta.version} sudah tersedia untuk public reader.`);
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : 'Publish gagal. Published version sebelumnya tetap aman.',
      ]);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="admin-page admin-editor" aria-labelledby="editor-title">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Draft Editor</p>
          <h1 id="editor-title">{draft.title || 'Bacaan Baru'}</h1>
        </div>
        <button className="back-button" type="button" onClick={() => navigate('/admin')}>
          Kembali
        </button>
      </div>

      {dirty ? <div className="admin-alert" role="status">Perubahan belum disimpan.</div> : null}
      {message ? <div className="admin-alert success" role="status">{message}</div> : null}
      <PublishedMetaNotice meta={publishedMeta} />
      {errors.length > 0 ? (
        <div className="admin-alert error" role="alert">
          {errors.map((error) => <p key={error}>{error}</p>)}
        </div>
      ) : null}

      <div className="admin-editor-section">
        <h2>Metadata</h2>
        <div className="admin-form-grid">
          <label>
            <span>Judul</span>
            <input
              value={draft.title}
              onChange={(event) => {
                const title = event.currentTarget.value;
                updateDraft((current) => ({
                  ...current,
                  title,
                  slug:
                    !current.slug || current.slug === generateSlug(current.title)
                      ? generateSlug(title)
                      : current.slug,
                }));
              }}
            />
          </label>
          <label>
            <span>Slug</span>
            <input
              value={draft.slug}
              onChange={(event) => {
                const slug = event.currentTarget.value;
                updateDraft((current) => ({ ...current, slug }));
              }}
            />
          </label>
          <label>
            <span>Kategori</span>
            <select
              value={draft.category}
              onChange={(event) => {
                const category = event.currentTarget.value as CategoryId;
                updateDraft((current) => ({ ...current, category }));
              }}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort Order</span>
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(event) => {
                const sortOrder = Number(event.currentTarget.value);
                updateDraft((current) => ({ ...current, sortOrder }));
              }}
            />
          </label>
          <label className="wide">
            <span>Description</span>
            <textarea
              value={draft.description}
              onChange={(event) => {
                const description = event.currentTarget.value;
                updateDraft((current) => ({ ...current, description }));
              }}
            />
          </label>
        </div>
      </div>

      <div className="admin-editor-section">
        <div className="admin-section-title">
          <h2>Blocks</h2>
          <button
            className="back-button"
            type="button"
            onClick={() => updateDraft((current) => ({ ...current, blocks: addBlock(current.blocks) }))}
          >
            + Tambah Blok
          </button>
        </div>

        <div className="block-editor-list">
          {draft.blocks.map((block, index) => (
            <BlockEditor
              block={block}
              index={index}
              key={block.id}
              total={draft.blocks.length}
              onChange={(nextBlock) =>
                updateDraft((current) => ({
                  ...current,
                  blocks: current.blocks.map((item) => (item.id === block.id ? nextBlock : item)),
                }))
              }
              onDelete={() => {
                if (!window.confirm(`Hapus Block ${index + 1}?`)) return;
                updateDraft((current) => ({ ...current, blocks: removeBlock(current.blocks, block.id) }));
              }}
              onMoveDown={() => updateDraft((current) => ({ ...current, blocks: moveBlock(current.blocks, index, 'down') }))}
              onMoveUp={() => updateDraft((current) => ({ ...current, blocks: moveBlock(current.blocks, index, 'up') }))}
            />
          ))}
        </div>
      </div>

      <div className="admin-editor-actions">
        <button className="primary-action" disabled={saving || publishing} type="button" onClick={handleSave}>
          {saving ? 'Menyimpan...' : 'Save Draft'}
        </button>
        <button className="back-button" type="button" onClick={() => setPreviewOpen(true)}>
          Preview
        </button>
        <button className="back-button" disabled={saving || publishing} type="button" onClick={handlePublish}>
          {publishing ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {previewOpen ? (
        <div className="admin-preview-layer">
          <div className="admin-preview-header">
            <strong>Preview Draft</strong>
            <button className="reading-header-button" type="button" onClick={() => setPreviewOpen(false)}>
              ×
            </button>
          </div>
          <ReadingPage content={previewDocument} forceShowAllContent onBack={() => setPreviewOpen(false)} />
        </div>
      ) : null}
    </section>
  );
}

function PublishedMetaNotice({ meta }: { meta: PublishedReadingMeta | null }) {
  if (!meta) {
    return <p className="admin-muted">Belum pernah dipublish.</p>;
  }

  return (
    <p className="admin-muted">
      Published version {meta.version}
      {meta.publishedAt ? ` • ${formatDateTime(meta.publishedAt)}` : ''}
    </p>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function AdminEditorShell({ children, title }: { children?: ReactNode; title: string }) {
  return (
    <section className="admin-page" role="status">
      <h1>{title}</h1>
      {children}
    </section>
  );
}

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onDelete,
  onMoveDown,
  onMoveUp,
}: {
  block: DraftBlock;
  index: number;
  total: number;
  onChange: (block: DraftBlock) => void;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
}) {
  return (
    <article className="block-editor">
      <div className="block-editor-header">
        <h3>Block {index + 1}</h3>
        <div>
          <button className="icon-button" disabled={index === 0} type="button" onClick={onMoveUp}>↑</button>
          <button className="icon-button" disabled={index === total - 1} type="button" onClick={onMoveDown}>↓</button>
          <button className="icon-button danger" type="button" onClick={onDelete}>Hapus</button>
        </div>
      </div>

      <label>
        <span>Arabic</span>
        <textarea
          className="arabic-input"
          dir="rtl"
          lang="ar"
          value={block.arabic}
          onChange={(event) => {
            const arabic = event.currentTarget.value;
            onChange({ ...block, arabic });
          }}
        />
      </label>
      <label>
        <span>Latin</span>
        <textarea
          value={block.latin}
          onChange={(event) => {
            const latin = event.currentTarget.value;
            onChange({ ...block, latin });
          }}
        />
      </label>
      <label>
        <span>Arti</span>
        <textarea
          value={block.translation}
          onChange={(event) => {
            const translation = event.currentTarget.value;
            onChange({ ...block, translation });
          }}
        />
      </label>
      <RepeatEditor repeat={block.repeat} onChange={(repeat) => onChange({ ...block, repeat })} />
      <label>
        <span>Note</span>
        <textarea
          value={block.note}
          onChange={(event) => {
            const note = event.currentTarget.value;
            onChange({ ...block, note });
          }}
        />
      </label>
    </article>
  );
}

function RepeatEditor({
  onChange,
  repeat,
}: {
  onChange: (repeat: number[] | null) => void;
  repeat: number[] | null;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const customValues = repeat?.length ? repeat : [3];
  const activePreset = repeatPresets.find((preset) => arraysEqual(preset.values, repeat));
  const isCustom = customOpen || !activePreset;

  return (
    <div className="repeat-editor">
      <span>Repeat</span>
      <div className="repeat-preset-row">
        {repeatPresets.map((preset) => (
          <button
            aria-pressed={!isCustom && activePreset?.id === preset.id}
            className="toggle-button"
            key={preset.id}
            type="button"
            onClick={() => {
              setCustomOpen(false);
              onChange(preset.values ? [...preset.values] : null);
            }}
          >
            {preset.label}
          </button>
        ))}
        <button
          aria-pressed={isCustom}
          className="toggle-button"
          type="button"
          onClick={() => {
            setCustomOpen(true);
            onChange(customValues);
          }}
        >
          Custom
        </button>
      </div>

      {isCustom ? (
        <div className="repeat-custom-list">
          {customValues.map((value, index) => (
            <div className="repeat-custom-row" key={index}>
              <input
                min="1"
                type="number"
                value={value}
                onChange={(event) => {
                  const repeatValue = Number(event.currentTarget.value);
                  const next = [...customValues];
                  next[index] = repeatValue;
                  onChange(next);
                }}
              />
              <span>x</span>
              <button
                className="icon-button"
                type="button"
                onClick={() => {
                  const next = customValues.filter((_, itemIndex) => itemIndex !== index);
                  onChange(next.length > 0 ? next : null);
                }}
              >
                Hapus
              </button>
            </div>
          ))}
          <button className="back-button" type="button" onClick={() => onChange([...customValues, 1])}>
            + Tambah Jumlah
          </button>
        </div>
      ) : null}

      <p className="admin-muted">Output: {formatRepeat(repeat)}</p>
    </div>
  );
}

function arraysEqual(a: readonly number[] | null, b: number[] | null) {
  if (!a && !b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

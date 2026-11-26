import { useEffect, useMemo, useState } from 'react'
import { createBook, deleteBook, getBook, listBooks, updateBook } from './api.js'

const currentYear = new Date().getFullYear()

const emptyBook = () => ({
  title: '',
  author: '',
  isbn: '',
  description: '',
  publicationYear: String(currentYear),
  copies: '0',
})

function sortBooks(books) {
  return [...books].sort((first, second) => first.title.localeCompare(second.title))
}

function AdminBooks({ token }) {
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [requestError, setRequestError] = useState('')
  const [notice, setNotice] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorBookId, setEditorBookId] = useState(null)
  const [editorForm, setEditorForm] = useState(emptyBook)
  const [editorError, setEditorError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [busyBookId, setBusyBookId] = useState(null)
  const [viewingBook, setViewingBook] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingBookId, setDeletingBookId] = useState(null)

  useEffect(() => {
    let active = true

    listBooks(token)
      .then((result) => {
        if (active) {
          setBooks(result)
          setRequestError('')
        }
      })
      .catch((error) => {
        if (active) setRequestError(error.message)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, reloadCount])

  const visibleBooks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return books

    return books.filter((book) =>
      [book.title, book.author, book.isbn].some((value) =>
        value.toLocaleLowerCase().includes(query),
      ),
    )
  }, [books, search])

  const openCreateForm = () => {
    setEditorBookId(null)
    setEditorForm(emptyBook())
    setEditorError('')
    setEditorOpen(true)
  }

  const openEditForm = async (id) => {
    setBusyBookId(id)
    setRequestError('')
    setNotice('')

    try {
      const book = await getBook(id, token)
      setEditorBookId(book.id)
      setEditorForm({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        description: book.description || '',
        publicationYear: String(book.publicationYear),
        copies: String(book.copies),
      })
      setEditorError('')
      setViewingBook(null)
      setEditorOpen(true)
    } catch (error) {
      setRequestError(error.message)
    } finally {
      setBusyBookId(null)
    }
  }

  const openDetails = async (id) => {
    setBusyBookId(id)
    setRequestError('')
    setNotice('')

    try {
      setViewingBook(await getBook(id, token))
    } catch (error) {
      setRequestError(error.message)
    } finally {
      setBusyBookId(null)
    }
  }

  const handleEditorChange = (event) => {
    const { name, value } = event.target
    setEditorForm((previous) => ({ ...previous, [name]: value }))
    setEditorError('')
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setEditorError('')
    setNotice('')

    const payload = {
      title: editorForm.title.trim(),
      author: editorForm.author.trim(),
      isbn: editorForm.isbn.trim(),
      description: editorForm.description.trim() || null,
      publicationYear: Number(editorForm.publicationYear),
      copies: Number(editorForm.copies),
    }

    try {
      const savedBook = editorBookId
        ? await updateBook(editorBookId, payload, token)
        : await createBook(payload, token)

      setBooks((previous) =>
        sortBooks(
          editorBookId
            ? previous.map((book) => (book.id === savedBook.id ? savedBook : book))
            : [...previous, savedBook],
        ),
      )
      setNotice(editorBookId ? 'Book details updated.' : 'Book added to the catalog.')
      setEditorOpen(false)
    } catch (error) {
      setEditorError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeletingBookId(deleteTarget.id)
    setRequestError('')
    setNotice('')

    try {
      await deleteBook(deleteTarget.id, token)
      setBooks((previous) => previous.filter((book) => book.id !== deleteTarget.id))
      setNotice(`“${deleteTarget.title}” was removed from the catalog.`)
      setDeleteTarget(null)
    } catch (error) {
      setRequestError(error.message)
    } finally {
      setDeletingBookId(null)
    }
  }

  const refreshBooks = () => {
    setIsLoading(true)
    setRequestError('')
    setReloadCount((count) => count + 1)
  }

  return (
    <section className="catalog-section" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">COLLECTION</p>
          <h2 id="catalog-title">Book catalog</h2>
          <p className="catalog-subtitle">Create, update, and organize the library collection.</p>
        </div>
        <button className="button button-primary add-book-button" onClick={openCreateForm}>
          <span aria-hidden="true">＋</span>
          Add a book
        </button>
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search books"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, author, or ISBN"
            type="search"
            value={search}
          />
        </label>
        <div className="catalog-toolbar-actions">
          <span className="catalog-count">
            {books.length} {books.length === 1 ? 'title' : 'titles'}
          </span>
          <button
            className="button button-quiet refresh-button"
            disabled={isLoading}
            onClick={refreshBooks}
            type="button"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {requestError && (
        <div className="catalog-alert" role="alert">
          <span>{requestError}</span>
          <button className="text-button" onClick={refreshBooks} type="button">Retry</button>
        </div>
      )}
      {notice && <p className="catalog-notice" role="status">{notice}</p>}

      <div className="book-list" aria-live="polite">
        {isLoading ? (
          <div className="catalog-empty">Loading the catalog...</div>
        ) : visibleBooks.length ? (
          visibleBooks.map((book) => (
            <article className="book-row" key={book.id}>
              <span className="book-cover" aria-hidden="true">▤</span>
              <div className="book-summary">
                <h3>{book.title}</h3>
                <p>{book.author} <span>·</span> {book.publicationYear}</p>
                <span className="book-isbn">ISBN {book.isbn}</span>
              </div>
              <div className="book-stock">
                <span className="stock-count">{book.copies}</span>
                <span>{book.copies === 1 ? 'copy' : 'copies'}</span>
              </div>
              <div className="book-actions">
                <button
                  className="text-button"
                  disabled={busyBookId === book.id}
                  onClick={() => openDetails(book.id)}
                  type="button"
                >
                  View
                </button>
                <button
                  className="text-button"
                  disabled={busyBookId === book.id}
                  onClick={() => openEditForm(book.id)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="text-button text-danger"
                  onClick={() => setDeleteTarget(book)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="catalog-empty">
            <span className="empty-book-icon" aria-hidden="true">▤</span>
            <h3>{search ? 'No matching books' : 'Your catalog is ready'}</h3>
            <p>
              {search
                ? 'Try another title, author, or ISBN.'
                : 'Add the first book to start building your collection.'}
            </p>
            {!search && (
              <button className="text-button" onClick={openCreateForm} type="button">
                Add your first book
              </button>
            )}
          </div>
        )}
      </div>

      {editorOpen && (
        <div className="modal-backdrop">
          <section
            aria-labelledby="book-editor-title"
            aria-modal="true"
            className="catalog-modal"
            role="dialog"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{editorBookId ? 'EDIT COLLECTION' : 'NEW TITLE'}</p>
                <h2 id="book-editor-title">{editorBookId ? 'Update book' : 'Add a book'}</h2>
              </div>
              <button
                aria-label="Close book form"
                className="modal-close"
                onClick={() => setEditorOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <form className="book-form" onSubmit={handleSave}>
              <label className="field">
                <span>Book title</span>
                <input
                  autoFocus
                  maxLength={200}
                  name="title"
                  onChange={handleEditorChange}
                  required
                  value={editorForm.title}
                />
              </label>
              <div className="book-form-grid">
                <label className="field">
                  <span>Author</span>
                  <input
                    maxLength={150}
                    name="author"
                    onChange={handleEditorChange}
                    required
                    value={editorForm.author}
                  />
                </label>
                <label className="field">
                  <span>ISBN</span>
                  <input
                    maxLength={20}
                    name="isbn"
                    onChange={handleEditorChange}
                    required
                    value={editorForm.isbn}
                  />
                </label>
                <label className="field">
                  <span>Publication year</span>
                  <input
                    max={9999}
                    min={0}
                    name="publicationYear"
                    onChange={handleEditorChange}
                    required
                    step={1}
                    type="number"
                    value={editorForm.publicationYear}
                  />
                </label>
                <label className="field">
                  <span>Copies</span>
                  <input
                    min={0}
                    name="copies"
                    onChange={handleEditorChange}
                    required
                    step={1}
                    type="number"
                    value={editorForm.copies}
                  />
                </label>
              </div>
              <label className="field">
                <span>Description <span className="optional-label">Optional</span></span>
                <textarea
                  maxLength={2000}
                  name="description"
                  onChange={handleEditorChange}
                  rows={4}
                  value={editorForm.description}
                />
              </label>
              {editorError && <p className="form-error" role="alert">{editorError}</p>}
              <div className="modal-actions">
                <button
                  className="button button-quiet"
                  onClick={() => setEditorOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="button button-primary" disabled={isSaving} type="submit">
                  {isSaving ? 'Saving...' : editorBookId ? 'Save changes' : 'Add book'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewingBook && (
        <div className="modal-backdrop">
          <section
            aria-labelledby="book-details-title"
            aria-modal="true"
            className="catalog-modal book-details-modal"
            role="dialog"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">CATALOG DETAILS</p>
                <h2 id="book-details-title">{viewingBook.title}</h2>
              </div>
              <button
                aria-label="Close book details"
                className="modal-close"
                onClick={() => setViewingBook(null)}
                type="button"
              >
                ×
              </button>
            </div>
            <p className="details-author">by {viewingBook.author}</p>
            <p className="details-description">
              {viewingBook.description || 'No description has been added for this title.'}
            </p>
            <dl className="details-grid">
              <div><dt>ISBN</dt><dd>{viewingBook.isbn}</dd></div>
              <div><dt>Publication year</dt><dd>{viewingBook.publicationYear}</dd></div>
              <div><dt>Copies</dt><dd>{viewingBook.copies}</dd></div>
            </dl>
            <div className="modal-actions">
              <button className="button button-quiet" onClick={() => setViewingBook(null)} type="button">
                Close
              </button>
              <button
                className="button button-primary"
                onClick={() => openEditForm(viewingBook.id)}
                type="button"
              >
                Edit details
              </button>
            </div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop">
          <section
            aria-labelledby="delete-book-title"
            aria-modal="true"
            className="catalog-modal confirm-modal"
            role="dialog"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">REMOVE FROM CATALOG</p>
                <h2 id="delete-book-title">Delete this book?</h2>
              </div>
              <button
                aria-label="Close delete confirmation"
                className="modal-close"
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                ×
              </button>
            </div>
            <p className="confirm-copy">
              “{deleteTarget.title}” will be permanently removed from the catalog.
            </p>
            {requestError && <p className="form-error" role="alert">{requestError}</p>}
            <div className="modal-actions">
              <button
                className="button button-quiet"
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                Keep book
              </button>
              <button
                className="button button-danger"
                disabled={deletingBookId === deleteTarget.id}
                onClick={handleDelete}
                type="button"
              >
                {deletingBookId === deleteTarget.id ? 'Deleting...' : 'Delete book'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default AdminBooks

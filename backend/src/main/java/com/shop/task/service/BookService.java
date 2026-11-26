package com.shop.task.service;

import com.shop.task.dto.BookRequest;
import com.shop.task.dto.BookResponse;
import com.shop.task.entity.Book;
import com.shop.task.exception.DuplicateIsbnException;
import com.shop.task.exception.BookNotFoundException;
import com.shop.task.repository.BookRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Transactional
    public BookResponse create(BookRequest request) {
        if (bookRepository.existsByIsbnIgnoreCase(request.isbn().trim())) {
            throw duplicateIsbn();
        }
        Book book = new Book(
                request.title().trim(),
                request.author().trim(),
                request.isbn().trim(),
                normalizeDescription(request.description()),
                request.publicationYear(),
                request.copies()
        );
        try {
            return BookResponse.from(bookRepository.saveAndFlush(book));
        } catch (DataIntegrityViolationException exception) {
            throw duplicateIsbn();
        }
    }

    @Transactional(readOnly = true)
    public List<BookResponse> findAll() {
        return bookRepository.findAll(Sort.by(Sort.Direction.ASC, "title"))
                .stream()
                .map(BookResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookResponse findById(Long id) {
        return BookResponse.from(getBook(id));
    }

    @Transactional
    public BookResponse update(Long id, BookRequest request) {
        Book book = getBook(id);
        String isbn = request.isbn().trim();
        if (!book.getIsbn().equalsIgnoreCase(isbn) && bookRepository.existsByIsbnIgnoreCase(isbn)) {
            throw duplicateIsbn();
        }
        book.update(
                request.title().trim(),
                request.author().trim(),
                isbn,
                normalizeDescription(request.description()),
                request.publicationYear(),
                request.copies()
        );
        try {
            return BookResponse.from(bookRepository.saveAndFlush(book));
        } catch (DataIntegrityViolationException exception) {
            throw duplicateIsbn();
        }
    }

    @Transactional
    public void delete(Long id) {
        Book book = getBook(id);
        bookRepository.delete(book);
    }

    private Book getBook(Long id) {
        return bookRepository.findById(id).orElseThrow(() -> new BookNotFoundException(id));
    }

    private String normalizeDescription(String description) {
        return description == null || description.isBlank() ? null : description.trim();
    }

    private DuplicateIsbnException duplicateIsbn() {
        return new DuplicateIsbnException();
    }
}

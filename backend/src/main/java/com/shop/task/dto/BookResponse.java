package com.shop.task.dto;

import com.shop.task.entity.Book;

public record BookResponse(
        Long id,
        String title,
        String author,
        String isbn,
        String description,
        int publicationYear,
        int copies
) {
    public static BookResponse from(Book book) {
        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getDescription(),
                book.getPublicationYear(),
                book.getCopies()
        );
    }
}

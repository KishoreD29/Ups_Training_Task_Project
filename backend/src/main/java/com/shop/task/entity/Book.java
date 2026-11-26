package com.shop.task.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "books", uniqueConstraints = @UniqueConstraint(columnNames = "isbn"))
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 150)
    private String author;

    @Column(nullable = false, length = 20)
    private String isbn;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private int publicationYear;

    @Column(nullable = false)
    private int copies;

    protected Book() {
    }

    public Book(
            String title,
            String author,
            String isbn,
            String description,
            int publicationYear,
            int copies
    ) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.description = description;
        this.publicationYear = publicationYear;
        this.copies = copies;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getIsbn() {
        return isbn;
    }

    public String getDescription() {
        return description;
    }

    public int getPublicationYear() {
        return publicationYear;
    }

    public int getCopies() {
        return copies;
    }

    public void update(
            String title,
            String author,
            String isbn,
            String description,
            int publicationYear,
            int copies
    ) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.description = description;
        this.publicationYear = publicationYear;
        this.copies = copies;
    }
}

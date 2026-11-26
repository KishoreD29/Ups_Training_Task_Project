package com.shop.task.repository;

import com.shop.task.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbnIgnoreCase(String isbn);
}

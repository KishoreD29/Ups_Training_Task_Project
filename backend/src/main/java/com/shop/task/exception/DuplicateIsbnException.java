package com.shop.task.exception;

public class DuplicateIsbnException extends RuntimeException {
    public DuplicateIsbnException() {
        super("A book with this ISBN already exists");
    }
}

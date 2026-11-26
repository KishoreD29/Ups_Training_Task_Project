package com.shop.task.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 150) String author,
        @NotBlank @Size(max = 20) String isbn,
        @Size(max = 2000) String description,
        @NotNull @Min(0) @Max(9999) Integer publicationYear,
        @NotNull @Min(0) Integer copies
) {
}

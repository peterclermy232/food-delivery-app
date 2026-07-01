package com.fooddelivery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddCardRequest {

    @NotBlank(message = "Card holder name is required")
    @Size(max = 100)
    private String holderName;

    @NotBlank(message = "Card number is required")
    @Pattern(regexp = "\\d{13,19}", message = "Card number must be 13-19 digits")
    private String cardNumber;

    @NotBlank(message = "Expiry date is required")
    @Pattern(regexp = "^(0[1-9]|1[0-2])/\\d{2}$", message = "Expiry must be MM/YY format")
    private String expiryDate;

    @NotBlank(message = "CVC is required")
    @Pattern(regexp = "\\d{3,4}", message = "CVC must be 3 or 4 digits")
    private String cvc;
}

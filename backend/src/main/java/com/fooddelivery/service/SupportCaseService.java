package com.fooddelivery.service;

import com.fooddelivery.dto.response.SupportCaseResponse;
import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.SupportCase;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.OrderRepository;
import com.fooddelivery.repository.SupportCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportCaseService {

    private final SupportCaseRepository supportCaseRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @Transactional
    public SupportCaseResponse raiseCase(String orderId, String subject, String description, User customer) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
        SupportCase sc = SupportCase.builder()
                .order(order)
                .customer(customer)
                .subject(subject != null ? subject : "Issue with order")
                .description(description != null ? description : "")
                .build();
        return SupportCaseResponse.from(supportCaseRepository.save(sc));
    }

    @Transactional(readOnly = true)
    public List<SupportCaseResponse> getCasesForOrder(String orderId) {
        return supportCaseRepository.findByOrderIdOrderByCreatedAtDesc(orderId)
                .stream().map(SupportCaseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<SupportCaseResponse> getMyCases(User customer) {
        return supportCaseRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream().map(SupportCaseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<SupportCaseResponse> getSellerCases(User seller) {
        return supportCaseRepository.findSellerCases(seller.getId())
                .stream().map(SupportCaseResponse::from).toList();
    }

    @Transactional
    public SupportCaseResponse replyToCase(String caseId, String message, User seller) {
        SupportCase sc = supportCaseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));
        if (!sc.getOrder().getRestaurant().getOwner().getId().equals(seller.getId()))
            throw new IllegalArgumentException("Access denied");
        sc.setReplyMessage(message);
        sc.setRepliedAt(java.time.LocalDateTime.now(java.time.ZoneOffset.UTC));
        sc.setStatus(SupportCase.CaseStatus.IN_REVIEW);
        SupportCase saved = supportCaseRepository.save(sc);
        notificationService.create(
            sc.getCustomer(),
            "Case Update",
            "The restaurant replied to your case: \"" + sc.getSubject() + "\"",
            "CASE_UPDATE"
        );
        return SupportCaseResponse.from(saved);
    }
}

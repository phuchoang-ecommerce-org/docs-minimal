# Backend Test Examples

## Concrete use of the four backend tools

**JUnit 5** uses `@Test`, `@ParameterizedTest` and `@MethodSource` for rating and state boundaries. **AssertJ** checks whole outcomes and exceptions, including persisted state. **Mockito** mocks repository/clock collaborators in application-service tests and verifies that forbidden writes never happen. **Spring Boot Test** boots configuration only for wiring, HTTP/security or transactions; use a MVC slice for controllers and `@SpringBootTest` with PostgreSQL for checkout.

Illustrative unit test:

```java
@ExtendWith(MockitoExtension.class)
class MarkSellerOrderPaidTest {
  @Mock SellerOrderRepository orders;
  @InjectMocks MarkSellerOrderPaid service;

  @Test void sellerCannotMarkAnotherSellersOrderPaid() {
    when(orders.findForSeller(42L, 7L)).thenReturn(Optional.empty());
    assertThatThrownBy(() -> service.markPaid(7L, 42L))
        .isInstanceOf(ResourceNotFound.class);
    verify(orders, never()).save(any());
  }
}
```

Illustrative web test:

```java
@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class)
class OrderControllerTest {
  @Autowired MockMvc mvc;
  @MockitoBean PlaceOrderService service;

  @Test void guestCannotCheckout() throws Exception {
    mvc.perform(post("/orders").contentType(APPLICATION_JSON).content("{}"))
       .andExpect(status().isUnauthorized());
    verifyNoInteractions(service);
  }
}
```

For stock contention, run Spring Boot against Testcontainers PostgreSQL, synchronize two workers before the conditional `UPDATE stock`, await both results and assert one order, one conflict, stock zero and matching audit. Do not mock the database behavior under test.

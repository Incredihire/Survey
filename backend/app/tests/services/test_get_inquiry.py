# def test_get_inquiry(db: Session) -> None:
#     length = random.randint(10, 255)
#     text = "".join(random.choices(string.ascii_lowercase, k=length)).capitalize()
#     inquiry_in = InquiryCreate(text=text)
#     created_inquiry = inquiries_service.create_inquiry(
#         session=db, inquiry_in=inquiry_in
#     )
#     retrieved_inquiry = db.get(Inquiry, created_inquiry.id)
#     assert retrieved_inquiry
#     assert retrieved_inquiry.text == created_inquiry.text
#     assert jsonable_encoder(created_inquiry) == jsonable_encoder(retrieved_inquiry)

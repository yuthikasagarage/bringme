export async function generateRandomNumber() {
  // simulate an asynchronous operation
  return new Promise((res) => setTimeout(res, 1000))
      .then(() => 22);
}

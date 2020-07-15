class MFAAPI {
  test() {
    fetch(`${SERVER}/mfa`)
      .then(res => {
        console.error(res.status, res.statusText);
        return res.json();
      });
  }
}
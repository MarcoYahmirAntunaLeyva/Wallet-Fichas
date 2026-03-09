*Crear Wallet-POST* 

*URL:* http://localhost:3000/api/wallet/create

*Body:*
{
  "userId": "test_user_002"
}

-----------------------------------------------------------

*Get Wallet- GET* 

*URL:* http://localhost:3000/api/wallet/test_user_001

*Body:*

-----------------------------------------------------------

*Deposit to Wallet-POST* 

*URL:* http://localhost:3000/api/wallet/deposit

*Body:*
{
  "userId": "test_user_001",
  "moneyAmount": 1000
}

-----------------------------------------------------------

*Bet-POST* 

*URL:* http://localhost:3000/api/wallet/bet

*Body:*
{
  "userId": "test_user_001",
  "chipsAmount": 150,
  "gameDescription": "Apuesta en Ruleta"
}

-----------------------------------------------------------

*Credit of Bet-POST* 

*URL:* http://localhost:3000/api/wallet/credit

*Body:*
{
  "userId": "test_user_001",
  "chipsAmount": 300,
  "gameDescription": "Premio Tragamonedas 2x Cereza"
}

-----------------------------------------------------------

*Info Packages- GET* 

*URL:* http://localhost:3000/api/wallet/info/packages

*Body:*

-----------------------------------------------------------

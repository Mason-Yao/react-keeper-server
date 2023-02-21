jwt application
1. jwt token should have a secret or private public key pair
2. when users try to sign in, the frontend server send the json post 
request to the backend just as in local strategy
3. the backend app.post receives the request and check the username 
and password manually, because the authenticate method in jwt strategy
is used for verifying rather than sign a user in. 
4. After signing in successfully, we still need to use jwt.sign in 
jsonwebtoken module to check the user in and generate token
5. we can either manage the token by passport and use authenticate() to
verify it or by ourselves like store it in local storage and use
verify function in jsonwebtoken to complete checking in.
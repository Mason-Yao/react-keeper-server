jwt application
1. jwt token should have a secret or private public key pair
2. when users try to sign in, the frontend server send the json post request to the backend just as in local strategy
3. the backend app.post receives the request and check the username and password manually, because the authenticate 
method in jwt strategy is used for verifying rather than sign a user in. 
4. After signing in successfully, we still need to use jwt.sign in jsonwebtoken module to check the user in and generate token
5. the token sent back to frontend has payload information, which can be taken along with axios request. the most import
thing is the payload will have information like id then can be encoded in backend server with secret key. then the
passport strategy will find it in database to generate user data, this can also be done by customized function.
6. we can either manage the token by passport and use authenticate() to verify it or by ourselves  and use
verify function in jsonwebtoken to complete checking in.

Provided by **userdata** component

⚠️ Note: **userdata** requires **process.env.ALLOWED_KEYS** to be set in the **.env** file.
____

# Client Side
 
## 💾 Data Storage

```js
//This is the callback function run when your data arrives from the database.
//The returned status will either be 'success' or 'fail'.
function onAvatarSaved(status){
  if(status=='success'){
     //DO SOMETHING
   }else{
     //DO SOMETHING ELSE
   }
}


CS1.db.save({avatar : 'Jill'} , onAvatarSaved)
```

## 💾 Data Retrieval

```js
//This is the callback function run when your data arrives from the database.
function setAvatar(value){
   //Set the avatar based on the value.
}

CS1.db.get('avatar', setAvatar);
```


# Server Side
 
## 💾 Data Storage

Implements gets an array of allowed keys from **process.env.ALLOWED_KEYS**.

Implements a **maxstore** variable to limit the size of any saved data.




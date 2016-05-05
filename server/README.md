```
python voodoo.py
```


curl http://127.0.0.1:5000/toggle/true

>  
  False

curl http://127.0.0.1:5000/toggle/false

>  
  True


curl http://127.0.0.1:5000/music.xml

>  
	<?xml version='1.0' encoding='UTF-8'?>
	<score-partwise version="3.0">
	  <movement-title>Voodoo</movement-title>
	  <identification>
	    ...

curl http://127.0.0.1:5000/reset

>  
	ok

curl http://127.0.0.1:5000/info

>  
	{
	  "l": 20,
	  "r": true
	}
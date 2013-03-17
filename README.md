Bewitch
===

Watches local directories and syncs the files to a local or remote location when contents have changed.

# Installation

```
npm -g i bewitch
```

# Usage


```
bewitch path/to/source user@host:/path/to/destination
```

Of course bewitch also allows multiple routes.

```
bewitch -f options.json
```

options.json
```javascript
{
	"ignore" : ".git",
	"routes" : {
		"path/to/foo" : "user@host:/path/to/foo",
		"path/to/bar" : "user@host:/path/to/bar"
	}
}
```

When you need fine-grained control, bewitch is there for you.

options.json
```javascript
{
	"ignore" : [ ".git", ".svn" ],
	"include" : "public",
	"exclude" : "test/**/*.md",
	"routes" : [{
		"source" : "path/to/bar",
		"destination" : "user@host:/path/to/bar"
	}, {
		"source" : "path/to/foo",
		"destination" : "user@host:/path/to/foo",
		"ignore" : ".*.sw*",
		"include" : [ "public/test.php", "*.js" ],
		"exclude" : "public/sass"
	}]
}
```
Relative paths are assumed to be relative to the config file.

# Requirements

To run bewitch properly, you'll need both `ssh` and `rsync`. Windows people can get them from [Cygwin](http://www.cygwin.com/). Mac and Linux people should already have them.

In addition, you'll need ssh access to the remote location if you want to sync to it!

const Repository = require('../models/Repository');

let urlRegex = /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/g;

module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res) {
            super(req, res);
            this.bookmarksRepository = new Repository('Bookmarks');
        }
        // GET: api/bookmarks
        // GET: api/bookmark/{id}
        get(id) {
            let params = this.getQueryStringParams()
            
            if (!isNaN(id)) {
                this.response.JSON(this.bookmarksRepository.get(id));
            }
            else if (params != null) {
                let res;
                if(Object.keys(params).length === 0){
                    res = new Repository('Parametre');
                    this.response.JSON(res.getAll());
                }
                res = this.bookmarksRepository.getAll()
                if ("sort" in params) {
                    switch (params.sort) {
                        case '"name"':
                            res = res.sort((a, b) => a.Name.localeCompare(b.Name))
                            break;
                        case '"category"':
                            res = res.sort((a, b) => a.Category.localeCompare(b.Category))
                            break;
                        default:
                            this.response.badRequest();
                            break;
                    }
                }
                if ("category" in params) {
                    let resArray = [];
                    let cat = params.category.substring(1, params.category.length-1);
                    res.forEach(e => {
                        if (e.Category === cat) {
                            resArray.push(e);
                        }
                    })
                    res = resArray;
                }
                if ("name" in params) {
                    let resArray = [];
                    let name = params.name.substring(1, params.name.length-1);
                    if (params.name.includes("*")) {
                        let query = name.split("*")[0]
                        res.forEach(e => {
                            if (e.Name.startsWith(query)) {
                                resArray.push(e);
                            }
                        })
                        res = resArray;
                    } else {
                        res.forEach(e => {
                            if (e.name == name) {
                                resArray.push(e);
                            }
                        })
                    }
                    res = resArray
                }
                this.response.JSON(res);
            }
            else {
                this.response.JSON(this.bookmarksRepository.getAll());
            }
        }
        // POST: api/contacts body payload[{"Id": 0, "Name": "...", "Url": "...", "Category": "..."}]
        post(bookmark) {
            if (this.verify(bookmark)) {
                let newBookmark = this.bookmarksRepository.add(bookmark);
                if (newBookmark)
                    this.response.created(newBookmark);
                else
                    this.response.internalError();
            }
            else {
                this.response.badRequest();
            }
        }
        // PUT: api/contacts body payloadd[{"Id": 0, "Name": "...", "Url": "...", "Category": "..."}]
        put(bookmark) {
            if (this.verify(bookmark)) {
                if (this.bookmarksRepository.update(bookmark))
                    this.response.ok();
                else
                    this.response.notFound();
            }
            else {
                this.response.badRequest();
            }
        }
        // DELETE: api/bookmarks/{id}
        remove(id) {
            if (this.bookmarksRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        }

        verify(bookmark) {
            if (!isNaN(bookmark.Id) && bookmark.Name != null && bookmark.Url != null && bookmark.Category != null) {
                if (bookmark.Url.match(urlRegex) != null) {
                    this.bookmarksRepository.getAll().forEach(e => {
                        if (e.Name == bookmark.Name) {
                            this.response.conflict();
                        }
                    })
                    return true;
                }
            }
            else {
                return false;
            }
        }
    }
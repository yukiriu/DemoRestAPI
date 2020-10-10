module.exports = 
class Parametre{
    constructor(verbe, url, role)
    {
        this.Verbe = verbe !== undefined ? verbe : "";
        this.Url = url !== undefined ? url : "";
        this.role = role !== undefined ? role : "";
    }
}
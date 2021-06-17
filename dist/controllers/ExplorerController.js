"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importStar(require("../typings/Controller"));
const QueryParser_1 = __importDefault(require("../helpers/QueryParser"));
const models = require("../models");
const Cache_1 = require("../cache/Cache");
const CostExplorer_1 = __importDefault(require("../services/CostExplorer"));
class ExplorerController extends Controller_1.default {
    constructor() {
        super(...arguments);
        this.path = '/explorer';
        this.routes = [
            {
                path: '',
                method: Controller_1.Methods.GET,
                handler: this.handleAddRep,
                localMiddleware: []
            }
        ];
    }
    handleAddRep(req, res, next) {
        const _super = Object.create(null, {
            sendSuccess: { get: () => super.sendSuccess },
            sendError: { get: () => super.sendError }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { client_id, cost_type_id, project_id } = req.query;
                let client_id_array = QueryParser_1.default.parseToArray(client_id);
                let cost_type_id_array = QueryParser_1.default.parseToArray(cost_type_id);
                let project_id_array = QueryParser_1.default.parseToArray(project_id);
                if (!cost_type_id_array.length) {
                    cost_type_id_array = Cache_1.CacheSingleton.getCostTypeGraph().getLeaves();
                }
                let explorerObject = new CostExplorer_1.default();
                explorerObject.setClientArray(client_id_array);
                explorerObject.setProjectArray(project_id_array);
                explorerObject.setCostTypeArray(cost_type_id_array);
                let data = yield explorerObject.getExplorerResult();
                const result = {
                    query: req.protocol + '://' + req.get('host') + req.url,
                    data: data
                };
                _super.sendSuccess.call(this, res, result);
            }
            catch (e) {
                console.log(e);
                _super.sendError.call(this, res);
            }
        });
    }
}
exports.default = ExplorerController;
// interface queryObject {
//     id : number 
// }
// class ExplorerQueryBuilder {
//     private clientQueryObject : queryObject | {};
//     private projectQueryObject : queryObject | {};
//     private query : any; 
//     constructor(client_id : Array<number>, cost_type_id : Array<number>, project_id : Array<number>){
//         this.clientQueryObject = (client_id.length) ? {
//             id : client_id 
//         } : {}; 
//         this.projectQueryObject = (project_id.length) ? {
//             id : project_id 
//         } : {}; 
//         console.log(this.clientQueryObject, this.projectQueryObject, cost_type_id); 
//         this.query = {
//             where :  this.clientQueryObject,
//             attributes : ['id','amount','name','type'], 
//             include : [{
//                 model : models.Project,
//                 as : 'children', 
//                 attributes : ['id','amount',['title','name'],'type'], 
//                 where : this.projectQueryObject,
//                 include : [{
//                     attributes : ['amount', ['cost_type_id','id']],
//                     model : models.Cost,
//                     as : "children",  
//                     where :  {
//                         'cost_type_id' :  cost_type_id 
//                     }
//                 }],
//             }],
//             order : [
//                 ['id', 'ASC'], 
//                 [ { model : models.Project, as : "children" }, 'id', 'ASC'] 
//             ],
//         }
//     }
//     public async getQueryResult() : Promise<Array<IExplorerItem>> {
//         let result = await models.Client.findAll(this.query);
//         result = result.map((node : any) =>  node.get({ plain : true})); 
//         result = result.map((client : any)=>{
//             client.children = client.children.map((project : any)=>{
//                 let nesterobj : DataArrayNester = new DataArrayNester(CacheSingleton.getCostTypeGraph(),project.children)
//                 project.children = nesterobj.getNesting().children;
//                 return project; 
//             })
//             return client 
//         })
//         result = result.map((client : any) =>{
//             let explorerObject= new ExplorerItem(client); 
//             return explorerObject.getNesting(); 
//         })
//         return result;
//     }
// }

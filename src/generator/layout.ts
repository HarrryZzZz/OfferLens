export type Density='dense'|'standard'|'spacious';
export type Layout={label:string;bodyPt:number;headingPt:number;lineTwips:number;lineRule:'exact'|'auto';paragraphTwips:number;marginTwips:number;marginCm:number;characterTwips:number;moduleTwips:number};
export const layouts:Record<Density,Layout>={
 dense:{label:'密集',bodyPt:9,headingPt:10.5,lineTwips:220,lineRule:'exact',paragraphTwips:0,marginTwips:680,marginCm:1.2,characterTwips:-6,moduleTwips:120},
 standard:{label:'标准（推荐）',bodyPt:10.5,headingPt:12,lineTwips:280,lineRule:'exact',paragraphTwips:60,marginTwips:1134,marginCm:2,characterTwips:0,moduleTwips:280},
 spacious:{label:'疏散',bodyPt:11,headingPt:13,lineTwips:360,lineRule:'auto',paragraphTwips:120,marginTwips:1417,marginCm:2.5,characterTwips:10,moduleTwips:330},
};

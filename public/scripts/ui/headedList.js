var BulletPoint = React.createClass({
    render:function(){
        var self = this
        //&#8226;
        function createMarkup() { return {__html: self.props.content}; };
        return(
            <li><div style={{display:"inline-grid"}}>&#8226;</div><div style={{display:"inline-grid"}} className="flow-text" dangerouslySetInnerHTML={createMarkup()}></div></li>
        )
    }
});

var HeadedList = React.createClass({
    render: function () {
        var points=[];
        var self = this;
        _.each(this.props.points,function(point,i){
            var point={content:point, key:self.props.firstLine+i};
            points.push(<BulletPoint {...point}/>);
        });
        return (
            <li>
                <div className="collapsible-header" style={{height:'auto'}}>
                    <h4>{this.props.firstLine}</h4>
                    <h5>{this.props.secondLine}</h5>
                    <h6>{this.props.dates}</h6>
                </div>
                <div className="collapsible-body">
                    <ul className="bullets">{points}</ul>
                </div>
            </li>
        )
    }
});


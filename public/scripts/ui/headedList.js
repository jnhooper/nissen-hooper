var BulletPoint = React.createClass({
    render:function(){
        var self = this
        //&#8226;
        function createMarkup() { return {__html: self.props.content}; };
        return(
            <li className="headedListItem"><div style={{paddingLeft:"0px"}}><b>&#8226;</b></div><span> </span><span className="flow-text" dangerouslySetInnerHTML={createMarkup()}></span></li>
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


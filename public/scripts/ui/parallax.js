
var CardList = React.createClass({
    render:function(){
        var listItems=[];
        _.each(this.props.html, function(li){
            listItems.push(<HeadedList {...li}/>);
        });
        return(
            <div className="CardList">
                <div className="parallax-container" style={{height:'400px'}}>
                    <div className="parallax"><img src={this.props.imageSrc}/></div>
                </div>
                <div className="section white z-depth-5">
                    <div className="row container">
                        <h2 className="header">{this.props.title}</h2>
                        <ul className="collapsible popout" data-collapsible="accordion">{listItems}</ul>
                    </div>
                </div>
            </div>
        )
    }
});

var ParagraphSection = React.createClass({
    render:function(){
        var self = this;
        function createMarkup() { return {__html: self.props.paragraph}; };

        return(
        <div className="ParagraphSection">
            <div className="parallax-container" style={{height:'400px'}}>
                <div className = "parallax"><img src={this.props.imageSrc}/></div>
            </div>
            <div className = "section white z-depth-5">
                <div className="container">
                    <h2 className="header">{this.props.title}</h2>
                    <p className="flow-text" dangerouslySetInnerHTML={createMarkup()}></p>
                </div>
            </div>
        </div>
        );
    }
});


var Parallax = React.createClass({

    render: function() {
        var type = this.props.type;
        if (type==undefined){
            type="CardList"
        }

        var sections = [];
        var data = this.props.data;

            for (var i = 0; i < data.length; i++) {
                if(type=="CardList") {
                    sections.push(<CardList {...data[i]} key={data[i].key}/>);
                }
                else if(type=="ParagraphSection") {
                    sections.push(<ParagraphSection {...data[i]} key={data[i].key}/>);
                }
            }

        return(
            <div>
            {sections}
            </div>
        );
    }
});



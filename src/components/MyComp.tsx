import React, { Component } from "react";

type MyCompProps = {
    text: string
    text2: string
}

class MyComp extends Component<MyCompProps> {
    static defaultProps = {
        text: "World"
    }

    render() {
        return (
            <div>
                {this.props.text2} {this.props.text}!
            </div>
        );
    }
}

export default MyComp;
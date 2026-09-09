import json
import subprocess
import sys

def handler(request):
    query = request.get('query', '')
    video_id = request.get('id', '')
    
    if not query and not video_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Query or ID required'})
        }
    
    try:
        search_query = query if query else f"https://www.youtube.com/watch?v={video_id}"
        
        result = subprocess.run(
            [
                sys.executable, '-m', 'yt_dlp',
                '--extract-audio',
                '--audio-format', 'mp3',
                '--no-download',
                '--print', 'url',
                '--print', 'title',
                '--print', 'thumbnail',
                f"ytsearch1:{search_query}" if query else search_query
            ],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        lines = result.stdout.strip().split('\n')
        
        if len(lines) >= 3:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'streaming_url': lines[0].strip(),
                    'title': lines[1].strip(),
                    'thumbnail': lines[2].strip()
                })
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Stream not found'})
            }
            
    except subprocess.TimeoutExpired:
        return {
            'statusCode': 504,
            'body': json.dumps({'error': 'Timeout'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
